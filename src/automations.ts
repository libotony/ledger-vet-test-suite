export const AutoSignMessage = {
    'version': 1,
    'rules': [
        {
            'text': 'Sign', 'x': 41, 'y': 3,
            'conditions': [
                ['message',false]
            ],
            'actions': [
                ['button', 2, true], ['button', 2, false],
            ]
        },
        {
            'text': 'Message hash', 'x': 28, 'y': 3,
            'actions': [
                ['button', 2, true], ['button', 2, false],
                ['setbool', 'message', true]
            ]
        },
        {
            'text': 'Sign', 'x': 41, 'y': 3,
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
            'text': 'Review', 'x': 41, 'y': 3,
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
            'text': 'Accept', 'x': 41, 'y': 3,
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