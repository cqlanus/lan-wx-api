'use strict';
module.exports = (sequelize, DataTypes) => {
  const PersonalWeatherStation = sequelize.define('PersonalWeatherStation', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    macAddress: DataTypes.STRING,
    apiKey: DataTypes.STRING,
    userId: DataTypes.UUID,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    }
  }, { freezeTableName: true });
  PersonalWeatherStation.associate = function(models) {
    PersonalWeatherStation.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
  };
  return PersonalWeatherStation;
};
