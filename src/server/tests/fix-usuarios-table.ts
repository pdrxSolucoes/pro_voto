import { supabase } from "../../services/supabase";

async function fixUsuariosTable() {
  console.log("🔧 Removendo coluna senha da tabela usuarios...");
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE usuarios 
      DROP COLUMN IF EXISTS senha;
    `
  });
  
  if (error) {
    console.error("❌ Erro:", error);
  } else {
    console.log("✅ Coluna senha removida com sucesso!");
  }
}

fixUsuariosTable();