-- Robust Business Logic API via RPCs

-- 1. Grab the next available order for a user with safety checks
create or replace function public.grab_order(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_balance numeric;
  v_vip_level int;
  v_daily_limit int;
  v_orders_today int;
begin
  -- Verify user and get current stats
  select balance, vip_level into v_balance, v_vip_level
  from public.profiles where user_id = p_user_id;

  if not found then
    return json_build_object('success', false, 'message', 'User profile not found');
  end if;

  -- Enforce VIP daily order limits
  select daily_order_limit into v_daily_limit
  from public.vip_levels where level = v_vip_level;

  select count(*) into v_orders_today
  from public.orders
  where user_id = p_user_id
    and created_at >= current_date
    and status in ('submitted', 'completed');

  if v_orders_today >= coalesce(v_daily_limit, 0) then
    return json_build_object('success', false, 'message', 'Daily order limit reached for your VIP level');
  end if;

  -- Find the next pending order and lock the row to prevent double-grabbing
  select * into v_order
  from public.orders
  where user_id = p_user_id and status = 'pending'
  order by created_at asc
  limit 1
  for update skip locked;

  if not found then
    return json_build_object('success', false, 'message', 'No pending orders available at this time');
  end if;

  -- Check if this is a "Combo" order requiring a higher balance
  if v_order.amount > v_balance then
    return json_build_object(
      'success', false,
      'needs_recharge', true,
      'order', row_to_json(v_order),
      'recharge_amount', (v_order.amount - v_balance)
    );
  end if;

  -- Successfully "grabbed" the order: move to 'submitted' status
  update public.orders
  set status = 'submitted'
  where id = v_order.id;

  return json_build_object('success', true, 'order', row_to_json(v_order));
end;
$$;

-- 2. Safely complete a submitted order and update balance
create or replace function public.submit_order(p_order_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order record;
  v_balance numeric;
begin
  -- Lock the order and verify ownership/status
  select * into v_order
  from public.orders
  where id = p_order_id and user_id = v_user_id
  for update;

  if not found or v_order.status != 'submitted' then
    return json_build_object('success', false, 'message', 'Invalid order status or order not found');
  end if;

  -- Check balance one last time
  select balance into v_balance from public.profiles where user_id = v_user_id for update;
  if v_balance < v_order.amount then
    return json_build_object('success', false, 'message', 'Insufficient balance to complete this order');
  end if;

  -- Atomic update: Complete order and add commission to profile
  update public.profiles
  set balance = balance + v_order.commission, updated_at = now()
  where user_id = v_user_id;

  update public.orders
  set status = 'completed', completed_at = now()
  where id = p_order_id;

  return json_build_object('success', true, 'message', 'Order completed successfully');
end;
$$;