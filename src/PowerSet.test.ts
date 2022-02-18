import PowerSet from "./PowerSet"


const SAMPLE_DATASET = {
    cols: [
        {
            name: "age",
            label: "Patient Age in Years",
            description: "Patient Age in Years",
            dataType: "integer"
        },
        {
            name: "gender",
            label: "Patient Gender",
            description: "Patient Gender",
            dataType: "string"
        },
        {
            name: "cnt",
            label: "Count",
            description: "Count",
            dataType: "integer"
        }
    ],
    rows: [
        [3   , null    , 13  ],
        [6   , null    , 11  ],
        [8   , null    , 12  ],
        [9   , null    , 14  ],
        [11  , null    , 14  ],
        [14  , null    , 16  ],
        [16  , "male"  , 17  ],
        [16  , null    , 22  ],
        [17  , "female", 15  ],
        [17  , null    , 24  ],
        [18  , null    , 14  ],
        [21  , null    , 15  ],
        [22  , null    , 11  ],
        [23  , "female", 12  ],
        [23  , null    , 18  ],
        [24  , "female", 12  ],
        [24  , null    , 19  ],
        [26  , null    , 13  ],
        [27  , "male"  , 13  ],
        [27  , null    , 19  ],
        [28  , "male"  , 13  ],
        [28  , null    , 20  ],
        [29  , null    , 16  ],
        [30  , "male"  , 12  ],
        [30  , null    , 20  ],
        [32  , null    , 11  ],
        [33  , null    , 11  ],
        [35  , "male"  , 15  ],
        [35  , null    , 24  ],
        [36  , "female", 13  ],
        [36  , null    , 17  ],
        [38  , "female", 15  ],
        [38  , null    , 17  ],
        [39  , null    , 13  ],
        [40  , null    , 14  ],
        [41  , null    , 14  ],
        [42  , null    , 15  ],
        [43  , null    , 14  ],
        [44  , null    , 11  ],
        [45  , null    , 14  ],
        [46  , "male"  , 12  ],
        [46  , null    , 19  ],
        [47  , null    , 14  ],
        [48  , null    , 17  ],
        [49  , null    , 13  ],
        [50  , "female", 11  ],
        [50  , null    , 17  ],
        [51  , null    , 19  ],
        [52  , "female", 12  ],
        [52  , "male"  , 11  ],
        [52  , null    , 23  ],
        [53  , null    , 15  ],
        [54  , null    , 16  ],
        [55  , null    , 15  ],
        [56  , null    , 15  ],
        [57  , null    , 17  ],
        [58  , null    , 11  ],
        [59  , null    , 12  ],
        [60  , "female", 12  ],
        [60  , "male"  , 18  ],
        [60  , null    , 30  ],
        [61  , null    , 12  ],
        [62  , "female", 11  ],
        [62  , null    , 17  ],
        [63  , "female", 11  ],
        [63  , null    , 16  ],
        [64  , "male"  , 13  ],
        [64  , null    , 23  ],
        [65  , null    , 11  ],
        [66  , null    , 12  ],
        [68  , "female", 11  ],
        [68  , null    , 19  ],
        [69  , null    , 14  ],
        [70  , "male"  , 15  ],
        [70  , null    , 17  ],
        [76  , null    , 14  ],
        [82  , null    , 13  ],
        [null, "female", 568 ],
        // [null, "male"  , 31  ],
        [null, "male"  , 583 ],
        [null, null    , 1151],
        // [null, null    , 39  ]
    ]
} as app.DataRequestData;


describe("PowerSet", () => {
    
    it ('pick', () => {
        const src = PowerSet.from(SAMPLE_DATASET);
        
        const set1 = src.pick(["gender"])
        expect(set1.cols.map(c => c.name)).toEqual(["gender", "cnt"]);
        // console.log(set1.rows)
        expect(set1.rows).toEqual([
            { age: null, gender: "female", cnt: 568 },
            { age: null, gender: "male"  , cnt: 583 }
        ]);

        const set2 = src.pick(["age", "gender"])
        expect(set2.cols.map(c => c.name)).toEqual(["age", "gender", "cnt"]);
        // console.log(set2.rows)
        expect(set2.rows).toEqual([
            { age: 16  , gender: "male"  , cnt: 17  },
            { age: 17  , gender: "female", cnt: 15  },
            { age: 23  , gender: "female", cnt: 12  },
            { age: 24  , gender: "female", cnt: 12  },
            { age: 27  , gender: "male"  , cnt: 13  },
            { age: 28  , gender: "male"  , cnt: 13  },
            { age: 30  , gender: "male"  , cnt: 12  },
            { age: 35  , gender: "male"  , cnt: 15  },
            { age: 36  , gender: "female", cnt: 13  },
            { age: 38  , gender: "female", cnt: 15  },
            { age: 46  , gender: "male"  , cnt: 12  },
            { age: 50  , gender: "female", cnt: 11  },
            { age: 52  , gender: "female", cnt: 12  },
            { age: 52  , gender: "male"  , cnt: 11  },
            { age: 60  , gender: "female", cnt: 12  },
            { age: 60  , gender: "male"  , cnt: 18  },
            { age: 62  , gender: "female", cnt: 11  },
            { age: 63  , gender: "female", cnt: 11  },
            { age: 64  , gender: "male"  , cnt: 13  },
            { age: 68  , gender: "female", cnt: 11  },
            { age: 70  , gender: "male"  , cnt: 15  },

        ]);
    });

    it ('filter', () => {
        const src = PowerSet.from(SAMPLE_DATASET);

        const set1 = src.filter(row => row.age! > 69);
        // console.log(set1.rows)
        expect(set1.rows).toEqual([
            { age: 70, gender: 'male', cnt: 15 },
            { age: 70, gender: null  , cnt: 17 },
            { age: 76, gender: null  , cnt: 14 },
            { age: 82, gender: null  , cnt: 13 }    
        ]);
    })

    // it ("groupRows", () => {
    //     const src = PowerSet.from(SAMPLE_DATASET);

    //     const rows = PowerSet.groupRows(src.pick(["age", "gender"]).rows, "gender")

    //     console.log(rows)
    // })

})