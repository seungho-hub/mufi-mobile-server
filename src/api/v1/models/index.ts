import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../../config/DBConfig";


export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: "mysql"
    }
)

sequelize.connectionManager.getConnection

//test connection
sequelize.authenticate()
    //success
    .then(() => {
        console.log("Data authentication sucessfully completed")
    })
    //got error
    .catch(err => {
        throw err
    })