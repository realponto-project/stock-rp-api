module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      "stockBase",
      [
        {
          id: "586b4f99-768b-457f-81fb-65dea9196095",
          stockBase: "ESTOQUE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "5216256a-70d6-4719-99c2-0ce87b0e31a1",
          stockBase: "EMPRESTIMO",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    ),

  down: (queryInterface) => queryInterface.bulkDelete("stockBase", null, {}),
};
