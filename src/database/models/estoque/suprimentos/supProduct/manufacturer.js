const Sequelize = require("sequelize");

module.exports = sequelize => {
  const manufacturer = sequelize.define("manufacturer", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });
  return manufacturer;
};
