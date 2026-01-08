const { createClient } = require('@supabase/supabase-js');

exports.handler = async function () {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('invoices') // substitui pelo nome da tua tabela
    .select('*')
    .limit(1);

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Erro de conexão', error }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'Conexão OK', data }),
  };
};
