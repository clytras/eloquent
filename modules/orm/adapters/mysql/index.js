import {connection,handleDisconnect} from './connection'
import Builder from './builder'
import { getTableName } from '../../../global/get-name'


class MysqlAdapter {

  /*
    Generic Adapter Methods (these should be in every adapter)
    select, create, queryBuilder, getJoins, makeRelatable
  /*


    Builds the mysql query, used query builder and root model class
  */
  select({ model, select, where, limit, joins = [] }) {
    var whereRaw = '';
    if(where) {
      if(typeof(where) == 'string') {
        whereRaw = ` WHERE ${where}`;
      } else if(where instanceof Object) {
        if (Object.keys(where).length == 1) {
          whereRaw = ` WHERE ${connection.escape(where)}`;
        } else if(Object.keys(where).length > 0) {
          whereRaw = ' WHERE ';
          Object.keys(where).forEach(function(key) {
            var condition = {};
            condition[key] = where[key];
            whereRaw += `${connection.escape(condition)} AND `;
          });
          whereRaw = whereRaw.substring(0, whereRaw.length-5);
        }
      }
    }

    return new Promise((resolve, reject) => {
      const options = {
        sql: `SELECT ${select ? select : '*'} FROM ${model.tableName()}${whereRaw}${this.getJoins(joins)}${limit ? ` LIMIT ${connection.escape(limit)}` : ''}`,
        nestTables: joins.length > 0 ? true : false
      }
      connection.query(options,  (error, results) => {
        if(error) {
          if(error.fatal){
              handleDisconnect();
          }
          return reject(error);
        }
        if(joins.length > 0) results = this.mergeInJoins(results)
        resolve(this.makeRelatable(limit === 1 ? results[0] : results, model))
      })
    })
  }

  /*
    create a row in the database
  */
  create({ model, data }) {
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO ${model.tableName()} SET ?`, data,  (error, result) => {
        if(error) {
          if(error.fatal){
              handleDisconnect();
          }
          return reject(error);
        }
        resolve(this.makeRelatable({
          id: result.insertId,
          ...data
        }, model))
      })
    })
  }

  save({ model }) {
    this.update({ model });
  }

  update({ model, data } = {}) {
    const pk = model.primaryKey();

    if(!data) {
      if(model.values) {
        data = model.values;
      } else {
        return new Promise((resolve, reject) => reject({ code: 'no-pk' }));
      }
    }

    var query = `UPDATE ${model.tableName()} SET ? WHERE ${pk} = ?`

    return new Promise((resolve, reject) => {
      connection.query(query, [data, data[pk]], (error, result) => {
        if(error) {
          if(error.fatal){
            handleDisconnect();
          }
          return reject(error);
        }
        var err = {
          message:"Not affect any row"
        };
        if (!result.affectedRows > 0){
          reject(err);
        }
        resolve(true, model)
      })
    })
  }

  createOrUpdate({ model, data, updateData = {}}) {
    return new Promise((resolve, reject) => {

      let _updatedData = { ...data };
      for(let updated in updateData) {
        if(updateData[updated] === undefined) {
          if(updated in _updatedData) {
            delete _updatedData[updated];
          }
        } else {
          _updatedData[updated] = updateData[updated];
        }
      }
  
      connection.query(`INSERT INTO ${model.tableName()} SET ? ON DUPLICATE KEY UPDATE ?`, [data, _updatedData], (error, result) => {
        if(error) {
          if(error.fatal){
            handleDisconnect();
          }
          return reject(error);
        }
        var err = {
          message:"Not affect any row"
        };
        if (!result.affectedRows > 0){
          reject(err);
        }
        resolve(true, model)
      })
    })
  }

  delete({ model, data } = {}) {
    const pk = model.primaryKey();

    if(!data) {
      if(model.values) {
        data = model.values;
      } else {
        return new Promise((resolve, reject) => reject({ code: 'no-pk' }));
      }
    }
    
    var query = `DELETE FROM ${model.tableName()} WHERE ${pk} = ?`

    return new Promise((resolve, reject) => {
      connection.query(query, [data[pk]], (error, result) => {
        if(error) {
          if(error.fatal){
            handleDisconnect();
          }
          return reject(error);
        }
        var err = {
          message:"Not affect any row"
        };
        if (!result.affectedRows > 0){
          reject(err);
        }
        resolve(true, model)
      })
    })
  }

  /*
    returns a new query builder instance
  */
  queryBuilder(options) {
    return new Builder(options)
  }

  /*
    creates join query from any model realtionships
    used on eager loads
  */
  getJoins(joins) {
    return joins.map(join => ` INNER JOIN \`${join.includeTable}\` ON ${join.localField} = ${join.remoteField}`)
  }


  /*
    Proxy object that returns item from resulting query
    or will check for a relationship on the model
    and return a promise.

    ex
    result.id -> returns `id` on the result Object

    result.users
      -> returns users if extists on the object.
         otherwise, checks for `users` function on the
         model and returns the related query promise
  */

  makeRelatable(result, model) {
    if(result == undefined) return null;
    return new Proxy(result, {
      get(target, name) {
        if(name in target) return target[name]
        if(getTableName(name) in target) return target[getTableName(name)]

        let instance = new model(result)
        if(name in instance) return instance[name]().result()
      }
    })
  }

  /*
    MYSQL SPECIFIC METHODS
  */


  /*
    Joins nested tables for when eager loading a relationship

    converts
    {
      users: { name: 'Bob'},
      chats: {...},
    }
    to
    {
      name: 'Bob',
      chats: {...}
    }
  */
  mergeInJoins(results) {
    return results.map(result => {
      let newResult = {}
      Object.keys(result).forEach((item, index) => {
        if(index === 0) newResult = result[item]
        else newResult[item] = result[item]
      })
      return newResult
    })
  }
}

export default new MysqlAdapter()
