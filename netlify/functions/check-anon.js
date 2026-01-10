exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Função check-anon ativa e a responder corretamente." })
  }
}
