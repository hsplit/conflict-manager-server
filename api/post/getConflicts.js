module.exports = (request, response) => {
  const { files, user } = request.body
  console.log({ files, user })
  response.json(user)
}
