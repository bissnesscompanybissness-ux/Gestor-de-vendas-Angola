hereconst { createClient } = require('@supabase/supabase-js');

exports.handler = async function () {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('invoices') // substitui pelo nome da tua tabela
    .select('*')
    .limit(1);

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Erro de conexão pública', error }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'Conexão pública OK', data }),
  };
};
