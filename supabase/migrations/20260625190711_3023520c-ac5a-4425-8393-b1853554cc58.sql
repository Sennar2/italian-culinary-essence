
REVOKE EXECUTE ON FUNCTION public.handle_new_member() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_member_id() FROM PUBLIC, anon;
-- authenticated keeps execute on current_member_id since it's used to scope reads
