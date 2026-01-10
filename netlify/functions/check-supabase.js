const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

exports.handler = async function(event, context) {
  try {
    const { data, error } = await supabase.from('test_table').select('*').limit(1)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Conexão com Supabase válida.", data })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro na função check-supabase.", error: err.message })
    }
  }
}
