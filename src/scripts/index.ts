import "../styles/style.css";
import * as HTMLHANDLER from "./HtmlHandler";
import * as QUEST from "./quest";
import { AllQuests, ArrOfBalls } from "./QuestsConfig";
import { App } from "./App";
import { Globals } from "./Globals";
import Stats from "stats.js";
import { LoadQuestsData } from "./DataHandler";
const test = require("./test");

Globals.App = new App();
for (let i = 0; i < AllQuests.length; i++) {
	QUEST.addQuest(AllQuests[i]);
}

test.setCallbackMethod(HTMLHANDLER.showQuestCompletedEffect);
// HTMLHANDLER.AssignClaimCallback((questID) => {
// 	//
// 	QUEST.getQuest(questID).claim();
// });
for (let i = 0; i < AllQuests.length; i++) {
	QUEST.addQuest(AllQuests[i]);
}

const loadQuests = LoadQuestsData();

// console.log(loadQuests);

Object.keys(loadQuests).forEach((key) => {
	QUEST.getQuest(key).claimed = loadQuests[key].claimed;
	QUEST.getQuest(key).completed = loadQuests[key].completed;
	QUEST.getQuest(key).isUnlocked = loadQuests[key].isUnlocked;
});

test.setCallbackMethod(HTMLHANDLER.showQuestCompletedEffect);

HTMLHANDLER.AssignClaimCallback((questID) => {
	QUEST.getQuest(questID).claim();
});
// HTMLHANDLER.showPanel(0);

HTMLHANDLER.addBallsToGameOverPanel(ArrOfBalls);
HTMLHANDLER.addOnBallAssignCallback((index: number) => {
	return false;
});
