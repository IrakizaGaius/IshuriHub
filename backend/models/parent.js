module.exports = (sequelize, DataTypes) => {
    const Parent = sequelize.define('Parent', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ACTIVE', 'DELETED'],
        allowNull: false
      }
    }, {});
    Parent.associate = function(models) {
      Parent.hasMany(models.Student, { foreignKey: 'parentId' });
    };
    return Parent;
  };