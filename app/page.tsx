import { createClient } from '@/lib/supabase/server';
import { ClientPage } from '@/components/ClientPage';

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <ClientPage user={user} />
} 