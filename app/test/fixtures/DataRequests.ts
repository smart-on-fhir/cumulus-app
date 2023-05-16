export default [
    {
        id: 1,
        name: 'Demo Data Subscription 1',
        description: 'Demo Data Subscription 1 description',
        refresh: 'manually',
        metadata: {
            cols: [
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"},
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}
            ],
            total: 3
        }
    },
    {
        id: 2,
        name: 'Demo Data Subscription 2',
        description: 'Demo Data Subscription 2 description',
        refresh: 'manually',
        metadata: {}
    },
    {
        id: 3,
        name: 'Demo Data Subscription 3',
        description: 'Demo Data Subscription 3 description',
        refresh: 'manually',
        metadata: {}
    }
]
