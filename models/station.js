'use strict';
module.exports = (sequelize, DataTypes) => {
    const Station = sequelize.define('station', {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            unique: true,
        },
        country3: DataTypes.STRING,
        country2: DataTypes.STRING,
        country: DataTypes.STRING,
        region: DataTypes.STRING,
        subregion: DataTypes.STRING,
        city: DataTypes.STRING,
        station_name_current: DataTypes.STRING,
        station_name_special: DataTypes.STRING,
        stn_key: DataTypes.STRING,
        icao_xref: DataTypes.STRING,
        national_id_xref: DataTypes.STRING,
        wmo_xref: DataTypes.INTEGER,
        wban_xref: DataTypes.INTEGER,
        iata_xref: DataTypes.STRING,
        status: DataTypes.STRING,
        icao: DataTypes.STRING,
        national_id: DataTypes.STRING,
        wmo: DataTypes.STRING,
        maslib: DataTypes.INTEGER,
        wban: DataTypes.INTEGER,
        special: DataTypes.STRING,
        lat_prp: DataTypes.FLOAT,
        lon_prp: DataTypes.FLOAT,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        }
    }, { freezeTableName: true });
    Station.associate = models => {
        Station.belongsToMany(models.User, { through: 'UsersStation', foreignKey: 'stationId', as: 'users' })
    }
    return Station;
};
