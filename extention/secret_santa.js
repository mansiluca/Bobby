const { WebClient } = require('@slack/web-api');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();
const slackClient = new WebClient(process.env.SLACK_TOKEN);

const loggersecretsanta = fs.createWriteStream('secretSanta.log', { flags: 'a' });

const participants = [
    { name: 'Exemple', slackId: 'U01A2B3C4D5' },
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function sendSecretSantaMessages() {
    const shuffledParticipants = shuffle([...participants]);
    const assignments = shuffledParticipants.map((participant, index) => {
        const recipient = shuffledParticipants[(index + 1) % shuffledParticipants.length];
        return { giver: participant, receiver: recipient };
    });

    for (const assignment of assignments) {
        const message = `Salut ${assignment.giver.name}, tu es le Secret Santa de ${assignment.receiver.name}!`;
        
        const res = await slackClient.conversations.open({
            users: assignment.giver.slackId
        });

        await slackClient.chat.postMessage({
            channel: res.channel.id,
            text: message,
        });
        
        console.log(`${assignment.giver.name} doit faire un cadeau à ${assignment.receiver.name}`);
        loggersecretsanta.write(`[INFO] ${assignment.giver.name} doit faire un cadeau à ${assignment.receiver.name}\n`);
    }
}

async function startSecretSanta(app) {
    const client = app.client;
    try {
        await sendSecretSantaMessages(client);
    } catch (error) {
        console.error('Erreur lors de l\'envoi des messages Secret Santa:', error);
        throw error;
    }
}

module.exports = { startSecretSanta };