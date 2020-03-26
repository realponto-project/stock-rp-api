const Sequelize = require("sequelize");

module.exports = sequelize => {
  const manufacturer = sequelize.define("manufacturer", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    }
  });
  return manufacturer;
};
