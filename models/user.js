'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      unique: true,
    },
    username: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    }

  }, { freezeTableName: true });
  User.associate = function(models) {
    User.belongsToMany(models.station, { through: 'UsersStation', foreignKey: 'userId', as: 'stations' })
    User.hasMany(models.PersonalWeatherStation, { as: 'pws', foreignKey: 'userId'})
  };
  return User;
};
