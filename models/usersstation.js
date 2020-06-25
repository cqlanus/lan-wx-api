'use strict';
module.exports = (sequelize, DataTypes) => {
  const UsersStation = sequelize.define('UsersStation', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    userId: DataTypes.UUID,
    stationId: DataTypes.UUID
  }, { freezeTableName: true });
  UsersStation.associate = function(models) {
    // associations can be defined here
    UsersStation.belongsTo(models.User, { foreignKey: 'userId' })
    UsersStation.belongsTo(models.station, { foreignKey: 'stationId' })
  };
  return UsersStation;
};
