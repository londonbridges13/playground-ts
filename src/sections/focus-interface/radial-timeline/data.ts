export interface Item {
  name: string;
  year: number;
  degree: number;
  variant?: "medium" | "large";
  title: string;
}

export interface Line {
  variant: Item["variant"];
  rotation: number;
  offsetX: number;
  offsetY: number;
  dataIndex: number | null;
}

export type Lines = Line[];
export type Data = Item[];

export const RAW_DATA: Data = [
  {
    name: "Sketchpad",
    year: 1962,
    degree: 0,
    variant: "large",
    title: "The first graphical interface",
  },
  {
    name: "Undo / Redo",
    year: 1968,
    degree: 0,
    variant: "medium",
    title: "Document manipulation commands",
  },
  {
    name: "Mother of All Demos",
    year: 1968,
    degree: 0,
    variant: "large",
    title: "Fundamentals of computing",
  },
  {
    name: "Xerox Alto",
    year: 1973,
    degree: 0,
    variant: "medium",
    title: "First commercial GUI",
  },
  {
    name: "Cut, Copy, Paste",
    year: 1974,
    degree: 0,
    variant: "medium",
    title: "Text manipulation commands",
  },
  {
    name: "Mac Icons",
    year: 1984,
    degree: 0,
    variant: "large",
    title: "Creation of new icon language",
  },
  {
    name: "World Wide Web",
    year: 1989,
    degree: 0,
    variant: "large",
    title: "Public domain computer networking",
  },
  {
    name: "Star7",
    year: 1991,
    degree: 0,
    variant: "large",
    title: "First demo of inertial scrolling",
  },
  {
    name: "Autocomplete",
    year: 2004,
    degree: 0,
    variant: "medium",
    title: "Faster search interface",
  },
  {
    name: "Infinite Scroll",
    year: 2006,
    degree: 0,
    variant: "large",
    title: "Scroll, scroll, scroll",
  },
  {
    name: "Multi-touch",
    year: 2006,
    degree: 0,
    variant: "medium",
    title: "Revolutionary touch interface",
  },
  {
    name: "iPhone Photos",
    year: 2007,
    degree: 0,
    variant: "medium",
    title: "Revolutionary photo management",
  },
  {
    name: "Autocorrect",
    year: 2007,
    degree: 0,
    variant: "medium",
    title: "No more typos",
  },
  {
    name: "Hashtag",
    year: 2007,
    degree: 0,
    variant: "large",
    title: "Organize your thoughts",
  },
  {
    name: "Tweetie",
    year: 2008,
    degree: 0,
    variant: "medium",
    title: "First mobile Twitter client",
  },
  {
    name: "Like Button",
    year: 2009,
    degree: 0,
    variant: "large",
    title: "Express your feelings",
  },
  {
    name: "BumpTop",
    year: 2009,
    degree: 0,
    variant: "medium",
    title: "3D desktop interface",
  },
  {
    name: "Clear",
    year: 2012,
    degree: 0,
    variant: "medium",
    title: "Gesture-based to-do list",
  },
  {
    name: "Figma",
    year: 2016,
    degree: 0,
    variant: "large",
    title: "Collaborative design tool",
  },
  {
    name: "Inter",
    year: 2017,
    degree: 0,
    variant: "medium",
    title: "Open-source typeface",
  },
  {
    name: "iPhone X",
    year: 2017,
    degree: 0,
    variant: "large",
    title: "Gestural OS interface",
  },
  {
    name: "iPad Pointer",
    year: 2020,
    degree: 0,
    variant: "medium",
    title: "Re-imagining the pointer",
  },
  {
    name: "Dynamic Island",
    year: 2022,
    degree: 0,
    variant: "medium",
    title: "Make use of space",
  },
  {
    name: "Vision Pro",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Spatial computing device",
  },
] as const;

let previousIndex = 0;

export function transformData(data: Data, minGap = 5) {
  return data.map((item, index) => {
    if (index !== 0) {
      const previousYear = data[index - 1].year;
      const currentYear = item.year;

      const yearDifference = currentYear - previousYear;
      if (yearDifference >= minGap) {
        item.degree = previousIndex + yearDifference;
      } else {
        item.degree = previousIndex + minGap + yearDifference;
      }
    } else {
      item.degree = 0;
    }

    previousIndex = item.degree;
    return item;
  });
}

export const DATA = transformData(RAW_DATA);

export const loremIpsum = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In scelerisque mollis mauris, eu condimentum massa tincidunt id. Vestibulum et consequat libero, at malesuada odio.",
  "Nam nec dapibus ligula. Donec aliquet convallis quam, id molestie felis vestibulum a. Duis at erat a risus posuere rhoncus vel at massa. Fusce fringilla diam quis est suscipit egestas.",
  "Cras rutrum, sem vitae convallis finibus, lacus risus dapibus erat, quis porta est mi et libero. Suspendisse volutpat fermentum felis, id pretium metus consequat sed.",
  "Sed euismod, erat sed efficitur eleifend, libero mi fringilla enim, ut facilisis risus dolor eget lectus. Integer eleifend sagittis odio, vitae convallis risus aliquam eget.",
  "Suspendisse sed nisi tristique, gravida lorem id, posuere lorem. Duis vehicula sapien nec lacinia vestibulum. Phasellus consequat ipsum vitae est congue, a mollis nunc vestibulum.",
  "Nulla in ipsum augue. Nulla facilisi. Nam imperdiet velit a risus volutpat, ac fringilla sapien dapibus. Maecenas dapibus laoreet facilisis.",
  "Etiam sit amet mi id leo eleifend viverra. Morbi ultrices ligula nec fringilla consectetur. Suspendisse ac justo non purus tempus fringilla non eu magna.",
  "Pellentesque luctus ornare imperdiet. Vivamus in odio tristique, rhoncus nibh at, placerat ipsum. Donec porta orci ex, ut dignissim quam pretium eleifend.",
  "Cras hendrerit lacus ac mi feugiat, non venenatis lorem congue. Ut eget diam ligula. Morbi eu commodo quam. Sed et lectus id mi facilisis dapibus.",
  "In viverra pretium cursus. Sed gravida, risus in consectetur feugiat, urna odio interdum metus, vitae dignissim augue purus ac neque.",
];
