module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      'user',
      [
        {
          id: '5bb177b7-0a9e-4d03-bf03-844d4e05763e',
          username: 'modrp',
          customized: false,
          tecnico: false,
          responsibleUser: 'modrp',
          resourceId: null,
          typeAccountId: '123e4567-e89b-12d3-a456-426655440000',
          password:
            '$2b$10$2hbmGpAGdqDGPbexzRi7v.nJhYs4ud5pz7PO0yMqnGbkAAYqdKidC',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    ),

  down: queryInterface => queryInterface.bulkDelete('user', null, {})
}
