export type BibleStory = { id: string; title: string; category: string; reference: string }
export const BIBLE_STORIES: BibleStory[] = [
    { id:"creation",title:"Creation",category:"Beginnings",reference:"Genesis 1" },
    { id:"noah",title:"Noah and the flood",category:"Deliverance",reference:"Genesis 6" },
    { id:"abraham",title:"Abraham's call",category:"Faith",reference:"Genesis 12:1-9" },
    { id:"sea",title:"Crossing the Red Sea",category:"Deliverance",reference:"Exodus 14" },
    { id:"joshua",title:"The fall of Jericho",category:"Battles",reference:"Joshua 6" },
    { id:"david",title:"David and Goliath",category:"Battles",reference:"1 Samuel 17" },
    { id:"elijah",title:"Elijah on Mount Carmel",category:"Encounters",reference:"1 Kings 18" },
    { id:"daniel",title:"Daniel in the lions' den",category:"Deliverance",reference:"Daniel 6" },
    { id:"birth",title:"Birth of Jesus",category:"Jesus",reference:"Luke 2:1-20" },
    { id:"storm",title:"Jesus calms the storm",category:"Miracles",reference:"Mark 4:35-41" },
    { id:"loaves",title:"Feeding the five thousand",category:"Miracles",reference:"John 6:1-14" },
    { id:"lazarus",title:"Jesus raises Lazarus",category:"Resurrection",reference:"John 11:1-44" },
    { id:"cross",title:"The crucifixion",category:"Jesus",reference:"Luke 23" },
    { id:"risen",title:"The resurrection",category:"Resurrection",reference:"Matthew 28" },
    { id:"pentecost",title:"The Holy Spirit at Pentecost",category:"Spirit",reference:"Acts 2" },
    { id:"paul",title:"Paul's conversion",category:"Encounters",reference:"Acts 9:1-19" }
]
