//-----IMPORTED FILES/MODULES
import { SchemaStore } from '../../store/schemaStore';
import { Edge } from '@/Types';

// Creates an array of all edges in the schema view
export default function createEdges(schemaObject: SchemaStore) {
  const edges: Edge[] = [];
 // Loop through each table in the schema object
 for (let table in schemaObject) {
  // Loop through each row in the table
  for (let rowName in schemaObject[table]) {
    const row = schemaObject[table][rowName];

    // If the row is a foreign key and has a reference, create an edge
    if (row.IsForeignKey && row.References && row.References.length > 0) {
      edges.push({
        id: `e${rowName}-${row.References[0].ReferencesPropertyName}`,
        source: `${table}.${rowName}`,
        sourceHandle: '',
        target: `${row.References[0].ReferencesTableName}.${row.References[0].ReferencesPropertyName}`,
        targetHandle: '',
        animated: true,
        arrowHeadType: 'arrowclosed',
        label: row.References[0].constraintName,
        style: {
            strokeWidth: 2,
            stroke: '#085c84',
        },
      
        markerEnd: {
            type: 'arrowclosed',
            orient: 'auto',
            width: 20,
            height: 20,
            color: '#085c84',
        },
      });
    }
  }
}

return edges;
}
