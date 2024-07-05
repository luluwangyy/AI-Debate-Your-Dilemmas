document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.id;

    if (currentPage === 'page1') {
        document.getElementById('submitConcern').addEventListener('click', async () => {
            const concern = document.getElementById('concern').value;
            const view1 = document.getElementById('view1').value;
            const view2 = document.getElementById('view2').value;
            const apiKey = document.getElementById('openaiApiKey').value;

            if (!concern || !view1 || !view2 || !apiKey) {
                alert('Please fill in all fields.');
                return;
            }

            localStorage.setItem('concern', concern);
            localStorage.setItem('view1', view1);
            localStorage.setItem('view2', view2);
            localStorage.setItem('apiKey', apiKey);

            const response = await fetch('/api/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ concern, view1, view2, apiKey })
            }).then(res => res.json());

            localStorage.setItem('question', response.question);
            window.location.href = 'question.html';
        });
    }

    if (currentPage === 'page2') {
        document.getElementById('question').innerText = localStorage.getItem('question');

        document.getElementById('submitAnswer').addEventListener('click', () => {
            const answer = document.getElementById('answer').value;

            if (!answer) {
                alert('Please provide an answer.');
                return;
            }

            localStorage.setItem('answer', answer);
            window.location.href = 'debate.html';
        });
    }

    if (currentPage === 'page3') {
        const concern = localStorage.getItem('concern');
        const view1 = localStorage.getItem('view1');
        const view2 = localStorage.getItem('view2');
        const answer = localStorage.getItem('answer');
        const apiKey = localStorage.getItem('apiKey');

        document.getElementById('summary').innerText = `Concern: ${concern}\nView 1: ${view1}\nView 2: ${view2}\nAdditional Info: ${answer}`;

        const chatBody = document.getElementById('chatbody');

        let round = 0;
        let currentMessage = concern;
        let currentView = view1;
        const conversationHistory = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: concern }
        ];

        const startDebate = async () => {
            while (round < 10) {
                round++;
                console.log(`Round ${round}: Sending request to /api/ai for ${currentView === view1 ? 'AI 1' : 'AI 2'}`);

                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ view: currentView, message: currentMessage, context: answer, history: conversationHistory, apiKey })
                }).then(res => res.json());

                if (!response.message) {
                    console.error('Error in AI response:', response.error);
                    break;
                }

                console.log(`Response from ${currentView === view1 ? 'AI 1' : 'AI 2'}:`, response);

                const newRow = document.createElement('tr');
                if (currentView === view1) {
                    newRow.innerHTML = `<td><div class="chatbox">${response.message}</div></td><td></td>`;
                    currentView = view2;
                } else {
                    newRow.innerHTML = `<td></td><td><div class="chatbox">${response.message}</div></td>`;
                    currentView = view1;
                }
                chatBody.appendChild(newRow);

                conversationHistory.push({ role: 'assistant', content: response.message });
                currentMessage = response.message;
            }
        };

        startDebate();
    }
});
