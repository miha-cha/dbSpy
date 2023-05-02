import { Request, Response, NextFunction, RequestHandler } from 'express';
import { TableColumns, TableSchema, ReferenceType, TableColumn } from '@/Types';
import { DataSource } from 'typeorm';
import { oracleSchemaQuery } from './queries/oracle.queries';

export const oracleQuery: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { hostname, password, port, username, database_name, service_name } = req.query;

        const OracleDataSource = new DataSource({
            type: "oracle",
            host: hostname as string,
            port: port ? parseInt(port as string) : 1521,
            username: username as string,
            password: password as string,
            database: database_name as string,
            serviceName: service_name as string,
            synchronize: true,
            logging: true,
          });

        await OracleDataSource.initialize();
        console.log('Data Source has been initialized');
        
          async function oracleFormatTableSchema(oracleSchema: TableColumn[], tableName: string): Promise<TableColumn> {
            const tableSchema: TableColumn = {};
      
        
            for (const column of oracleSchema) {
                const columnName: any = column.COLUMN_NAME;
                const keyString: any = column.CONSTRAINT_TYPE;
        
                //Creating the format for the Reference property if their is a foreign key
                const references: ReferenceType = {
                    length: 0,
                };

                //Formation of the Reference data
                if (column.CONSTRAINT_TYPE === 'R'){
                    references[references.length] = {
                        isDestination: false,
                        PrimaryKeyName: column.COLUMN_NAME,
                        PrimaryKeyTableName: column.TABLE_NAME,
                        ReferencesPropertyName: column.R_COLUMN_NAME,
                        ReferencesTableName: column.R_TABLE_NAME,
                        constraintName: column.CONSTRAINT_NAME,
                    };
                    references.length += 1;
                };
        
                //Formation of the schema data
                tableSchema[columnName] = {
                    IsForeignKey: keyString ? keyString.includes('R') ? true : false : false,
                    IsPrimaryKey: keyString ? keyString.includes('P') ? true : false : false,
                    Name: column.COLUMN_NAME,
                    References: column.CONSTRAINT_TYPE === 'R' ? [references] : [],
                    TableName: username + '.' + tableName,
                    Value: null,
                    additional_constraints: column.IS_NULLABLE === 'N' ? 'NOT NULL' : null ,
                    data_type: column.DATA_TYPE + `${column.DATA_TYPE.includes('VARCHAR2') ? `(${column.CHARACTER_MAXIMUM_LENGTH})` : ''}`,
                    field_name: column.COLUMN_NAME,
                };
            };
            return tableSchema;
        };

        const tables: [{TABLE_NAME: string}] = await OracleDataSource.query(`SELECT table_name FROM user_tables`);
        console.log('tables: ', tables)
        //Declare constants to store results we get back from queries
        const tableData: TableColumns = {};
        const schema: TableSchema = {};

            for (const table of tables) {
                const tableName: string = table.TABLE_NAME
                const user: string = username as string

                const tableDataQuery = await OracleDataSource.query(`SELECT * FROM "${user.toUpperCase()}"."${tableName}"`);
                tableData[tableName] = tableDataQuery;

                const oracleSchema = await OracleDataSource.query(oracleSchemaQuery.replace('user', user.toUpperCase()).replace('tableName', tableName));
                console.log('oracleSchema: ', oracleSchema)
                schema[username + '.' + tableName] = await oracleFormatTableSchema(oracleSchema, tableName);
            };

        // Console.logs to check what the data looks like
        // console.log('table data: ', tableData);
        // console.log('schema data: ', schema);

        // Storage of queried results into res.locals
        res.locals.data = tableData;
        res.locals.schema = schema;

        // Disconnecting after data has been received 
        OracleDataSource.destroy();
        console.log('Disconnected from the database');

        return next();
    
    } catch(err) {
        return next(err);
    };
};