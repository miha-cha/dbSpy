import axios from 'axios';
import React, { useState, useEffect } from 'react';
import useDataStore from '../../store/dataStore';
import useCredentialsStore from '../../store/credentialsStore';
import useSchemaStore from '../../store/schemaStore';
import RowInput from './RowInput';


type InputModalProps = {
  closeInputModal: () => void;
  tableNameProp?: string;
};

type DataRowArray = Array<string | number | boolean | null>

export default function DataInputModal({
  closeInputModal,
  tableNameProp,
}: InputModalProps) {

  //console.log('table', tableNameProp) // this is name of current table we chose

  const [tableName, setTableName] = useState(tableNameProp);
  const [rowData, setRowData] = useState([]);
  const { schemaStore, setSchemaStore } = useSchemaStore((state) => state);
  const { dbCredentials } = useCredentialsStore((state) => state);
  const { dataStore, setDataStore } = useDataStore((state) => state);

  //console.log("dbCredentials", dbCredentials)

  const updatingDB = (newRow: Array<{}>):void => {
    axios
      .post(`api/sql/${dbCredentials.db_type}/data`, {tableName: tableName, newRow: newRow})
      .then((res) => {
        console.log('data has been sent to DB');
      })
      .catch((err: ErrorEvent) => { console.error('sending new row error', err) })
  }

  const secondaryColumnNames: string[] = Object.keys(schemaStore['public.' + tableName])

  const deepCopyDataStore = JSON.parse(JSON.stringify(dataStore))
  const currentTable = deepCopyDataStore[tableName]  

  const handleSubmit = (): boolean => { 
    console.log('how about here?', dataStore)
    try {
      const additionalRow: {[key:string]:string |number |boolean | null} = {}
      if (!currentTable.length) {
        secondaryColumnNames.forEach((columnName, i) => {
          additionalRow[columnName] = rowData[i];
        });
      } else {
        Object.keys(currentTable[0]).forEach((columnName, i) => {
          additionalRow[columnName] = rowData[i];
        });
      }
      
      currentTable.push(additionalRow)
      //console.log('after update', currentTable)
      console.log('before updating', dataStore)
      updatingDB(currentTable[currentTable.length - 1])
      // setDataStore({...dataStore, [tableName]:currentTable})
      console.log('dbCredentials',dbCredentials)
      const getUpdatedData = axios
       .get(`api/sql/${dbCredentials.db_type}/schema`, { params: dbCredentials })
       .then(res => {
         console.log('refetched', res.data)
        //  please = res.data
         setDataStore(res.data.data)
         return res.data
       })
       .catch((err: ErrorEvent) => console.error('getSchema error', err))

      console.log('after updating', dataStore)
      // console.log('updated dataStore', dataStore)
      return true;
    } catch (error) {
      window.alert(error);
      console.error(error);
      return false;
    }
  };

  const values: Array<string | number | boolean | null> = []

  const handleRowChange = (
    index: number,
    value: string | number | boolean | null
  ) => {
   
    values.push(value)
    //console.log('entered values', values)
    //console.log(values[values.length - 1], index);

    //updating rowData
    setRowData((prevRows) => {
      prevRows[index] = values[values.length - 1]
      return [...prevRows]
    })
 console.log('before updating?',dataStore)
    //console.log("we just updated rowData", rowData)
  }

  return (
    <div id="inputModal" className="input-modal" >
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const isSuccessful: boolean = handleSubmit();
          if (isSuccessful) closeInputModal();
        }}
        className="modal-content  rounded-md  bg-[#f8f4eb] shadow-[0px_5px_10px_rgba(0,0,0,0.4)] dark:bg-slate-800 dark:shadow-[0px_5px_10px_#1e293b]"
      >
        <div className="table-name">
          {<h1>{`Table Name: ${tableName}`}</h1>}
        </div>        
        <div className="column-header" >
          <h1 className="text-slate-900 dark:text-[#f8f4eb] flex-auto">
            {'New Row'}
          </h1>
        </div>
        <RowInput
          currentTable={currentTable}
          handleRowChange={handleRowChange}
          secondaryColumnNames={secondaryColumnNames}
        />
        <div className="mx-auto flex w-[50%] max-w-[200px] justify-between">
          <button
            type="button"
            className="modalButton text-slate-900 hover:opacity-70 dark:text-[#f8f4eb]"
            onClick={closeInputModal}
            data-testid="modal-cancel"
          >
            Cancel
          </button>
          <button
            className="modalButton text-slate-900 hover:opacity-70 dark:text-[#f8f4eb]"
            data-testid="modal-submit"
          >
            Add Row
          </button>
        </div>
      </form>
    </div>
  );
}
