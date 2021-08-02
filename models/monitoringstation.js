'use strict';
module.exports = (sequelize, DataTypes) => {
    const MonitoringStation = sequelize.define('monitoringstation', {
        id: {
            allowNull: false,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true,
            type: DataTypes.UUID
        },
        aqsid: DataTypes.STRING,
        param: DataTypes.STRING,
        site_code: DataTypes.STRING,
        site_name: DataTypes.STRING,
        status: DataTypes.STRING,
        agency_id: DataTypes.STRING,
        agency_name: DataTypes.STRING,
        epa_region: DataTypes.STRING,
        latitude: DataTypes.FLOAT,
        longitude: DataTypes.FLOAT,
        coord: DataTypes.GEOMETRY('POINT', 4326),
        elevation: DataTypes.STRING,
        gmt_offset: DataTypes.STRING,
        country_code: DataTypes.STRING,
        msa_code: DataTypes.STRING,
        msa_name: DataTypes.STRING,
        state_code: DataTypes.STRING,
        state_name: DataTypes.STRING,
        county_code: DataTypes.STRING,
        county_name: DataTypes.STRING,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        }

    }, { freezeTableName: true });
    return MonitoringStation;
};
