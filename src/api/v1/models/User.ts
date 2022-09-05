import { sequelize } from "./index"
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
    id: {
        //uuid v4 => 36byte
        type: DataTypes.STRING(36),
        primaryKey: true,
        unique: true,
    },
    username: {
        //korean 12lenght username => 36byte
        type: DataTypes.STRING(36),
        allowNull: false,
        validate: {
            len: {
                args: [4, 12],
                msg: "username은 4글자 이상 12글자 이하여야 합니다."
            }
        },
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: { msg: "이메일이 유효하지 않습니다" }

        },
        unique: true,
    },
    encrypted_password: {
        //md5 hashed string => 32byte
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: false,
    },
    store_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
})

export default User
