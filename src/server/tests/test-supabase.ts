import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rrgfncqdsrmhziwhziqy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ2ZuY3Fkc3JtaHppd2h6aXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTc4NzUsImV4cCI6MjA2NjAzMzg3NX0.cgqB_xDmJyTtjLy_D6VWEr1j_wQAYv0SwksZRvruYGQ"; // sua chave

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Erro na conexão:", error);
    } else {
      console.log("✅ Conexão com Supabase bem-sucedida!");
      console.log("🔗 URL:", supabaseUrl);
      console.log("🔑 Autenticação: OK");
    }
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
  }
}

testConnection();
