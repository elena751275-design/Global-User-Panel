-- Add a function to get the currently submitted order for a user
create or replace function public.get_current_submitted_order(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
begin
  -- Find the next submitted order for the user
  select * into v_order
  from public.orders
  where user_id = p_user_id and status = 'submitted'
  order by created_at asc
  limit 1;

  if not found then
    return json_build_object('success', false, 'message', 'No submitted orders found');
  end if;

  return json_build_object('success', true, 'order', row_to_json(v_order));
end;
$$;