-- 1. Fetch balance and task progress
create or replace function public.get_user_profile(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_tasks_completed int;
begin
  select balance, vip_level into v_profile
  from public.profiles where user_id = p_user_id;

  select count(*) into v_tasks_completed
  from public.orders
  where user_id = p_user_id 
    and status = 'completed' 
    and created_at >= current_date;

  return json_build_object(
    'balance', coalesce(v_profile.balance, 0),
    'vip_level', coalesce(v_profile.vip_level, 1),
    'tasks_completed_today', v_tasks_completed
  );
end;
$$;

-- 2. Fetch active task with Combo and Recharge logic
create or replace function public.get_user_active_task(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_profile record;
  v_is_combo boolean := false;
  v_remaining_recharge numeric := 0;
begin
  -- Get the current active (submitted) order
  select * into v_order
  from public.orders
  where user_id = p_user_id and status = 'submitted'
  order by created_at desc
  limit 1;

  if not found then
    return json_build_object('active', false);
  end if;

  -- Logic: Check if it's a combo (amount exceeds user balance)
  -- Or if it matches a specific task index (admin logic)
  select balance into v_profile from public.profiles where user_id = p_user_id;
  
  if v_order.amount > v_profile.balance then
    v_is_combo := true;
    v_remaining_recharge := v_order.amount - v_profile.balance;
  end if;

  return json_build_object(
    'active', true,
    'order', row_to_json(v_order),
    'is_combo', v_is_combo,
    'remaining_recharge', v_remaining_recharge
  );
end;
$$;