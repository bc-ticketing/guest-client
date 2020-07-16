function getEvent(id) {
    const events = {};
    events[1] = {
        name: "Bastille",
        Type: "Concert",
        lowestPrice: "0.2",
        date: "15.12.20",
        location: "Zurich",
        id: "1",
        organizer: "Events Gmbh",
        description: "This will be an awesome open air if covid-19 does not fuck it up and it will be super cool for sure",
        approvers: "Idetix",
        img_url: require("@/assets/event_img/event_1.jpg"),
    };
    events[2] = {
        name: "Theatre",
        Type: "Arts",
        lowestPrice: "0.35",
        date: "03.05.20",
        location: "Zurich",
        id: "2",
        organizer: "Sick Theaters",
        description: "Sick Theaters will host this screening for the fist time since the covid outbreak and it will be super awesome so dont fucking miss it",
        approvers: "SBB",
        img_url: require("@/assets/event_img/event_2.jpg"),
    };
    events[3] = {
        name: "Robin Schulz",
        Type: "Concert",
        lowestPrice: "0.11",
        date: "04.05.20",
        location: "Zurich",
        id: "3",
        organizer: "GN",
        description: "",
        approvers: "Idetix",
        img_url: require("@/assets/event_img/event_3.jpg"),
    };

    return events[id];
}
export default getEvent;