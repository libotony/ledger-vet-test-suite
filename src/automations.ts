export const AutoSignMessage = {
    'version': 1,
    'rules': [
        {
            'regexp': 'ign',
            'conditions': [
                ['message',false]
            ],
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        },
        {
            'regexp': 'Sign',
            'conditions': [
                ['message',false]
            ],
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        },
        {
            'regexp': 'Message hash',
            'actions': [
                ['button', 2, true], ['button', 2, false],
                ['setbool', 'message', true]
            ]
        },
        {
            'regexp': 'Sign',
            'conditions': [
                ['message',true]
            ],
            'actions': [
                ['button', 1, true], ['button', 2, true],
                ['button', 1, false],
                ['setbool', 'message', false]
            ]
        },
        {
            'actions': [
                [
                    'setbool',
                    'default_match',
                    true
                ]
            ]
        }
    ]
}

export const AutoSignTransaction = {
    'version': 1,
    'rules': [
        {
            'regexp': 'Review',
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        },
        {
            'regexp': 'Amount',
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        },
        {
            'regexp': 'Address',
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        },
        {
            'regexp': 'Max Fees',
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        }, {
            'regexp': 'Accept',
            'actions': [
                ['button', 1, true], ['button', 2, true],
                ['button', 1, false],
            ],
        }, {
            'regexp': 'WARNING',
            'actions': [
                ['button', 1, true], ['button', 2, true],
                ['button', 1, false],
            ]
        }, {
            'regexp': 'WARNlNG',
            'actions': [
                ['button', 1, true], ['button', 2, true],
                ['button', 1, false],
            ]
        },
        {
            'actions': [
                [
                    'setbool',
                    'default_match',
                    true
                ]
            ]
        }
    ]
}

export const Default = {
    'version': 1,
    'rules': [
        {
            'actions': [
                [
                    'setbool',
                    'default_match',
                    true
                ]
            ]
        }
    ]
}