export default [
    {
        id: 1,
        name: 'Demo Data Subscription 1',
        description: 'Demo Data Subscription 1 description',
        metadata: {
            cols: [
                {"name": "gender"  , "label": "Gender" , "dataType": "string" , "description": "Gender" },
                {"name": "cnt"     , "label": "Cnt"    , "dataType": "integer", "description": "Cnt"    },
                {"name": "_float"  , "label": "Float"  , "dataType": "float"  , "description": "Float"  },
                {"name": "_boolean", "label": "Boolean", "dataType": "boolean", "description": "Boolean"}
            ],
            total: 3
        }
    },
    {
        id: 2,
        name: 'Demo Data Subscription 2',
        description: 'Demo Data Subscription 2 description',
        metadata: {}
    },
    {
        id: 3,
        name: 'Demo Data Subscription 3',
        description: 'Demo Data Subscription 3 description',
        metadata: {}
    }
]
