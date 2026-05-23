-- Ensure new users get profile + referred_by linkage from signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_invite_code text;
  v_referrer uuid;
  v_new_code text;
begin
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_invite_code := nullif(new.raw_user_meta_data->>'invitation_code', '');

  if v_invite_code is not null then
    select user_id into v_referrer
      from public.profiles
      where invitation_code = v_invite_code
      limit 1;
  end if;

  loop
    v_new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.profiles where invitation_code = v_new_code);
  end loop;

  insert into public.profiles (user_id, username, invitation_code, referred_by)
  values (new.id, v_username, v_new_code, v_referrer)
  on conflict (user_id) do update
    set referred_by = coalesce(public.profiles.referred_by, excluded.referred_by);

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pay 10% referral commission when a deposit is confirmed
create or replace function public.pay_referral_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
  v_commission numeric;
begin
  if new.status = 'confirmed' and (old.status is distinct from 'confirmed') then
    select referred_by into v_referrer
      from public.profiles
      where user_id = new.user_id;

    if v_referrer is not null then
      v_commission := round((new.amount * 0.10)::numeric, 2);

      update public.profiles
        set balance = balance + v_commission,
            updated_at = now()
        where user_id = v_referrer;

      insert into public.audit_log (admin_id, action, target_user_id, amount, details)
      values (
        v_referrer,
        'referral_commission',
        new.user_id,
        v_commission,
        jsonb_build_object('deposit_id', new.id, 'deposit_amount', new.amount, 'rate', 0.10)
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_deposit_confirmed_pay_commission on public.deposits;
create trigger on_deposit_confirmed_pay_commission
  after update on public.deposits
  for each row execute function public.pay_referral_commission();

-- Allow referrers to read minimal info about their referred users' profiles
drop policy if exists "Referrer can view referred profiles" on public.profiles;
create policy "Referrer can view referred profiles"
  on public.profiles
  for select
  to authenticated
  using (referred_by = auth.uid());

-- Allow referrers to read their referred users' confirmed deposits (for stats)
drop policy if exists "Referrer can view referred deposits" on public.deposits;
create policy "Referrer can view referred deposits"
  on public.deposits
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = deposits.user_id
        and p.referred_by = auth.uid()
    )
  );

-- Allow users to read their own commission audit entries
drop policy if exists "Users can view their own commission audit" on public.audit_log;
create policy "Users can view their own commission audit"
  on public.audit_log
  for select
  to authenticated
  using (admin_id = auth.uid() and action = 'referral_commission');
