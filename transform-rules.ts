import * as fs from "fs";
import * as yaml from "js-yaml";

let obj: any = JSON.parse(fs.readFileSync("./samples/sample-voteorder.json", "utf8"));
/*fs.writeFileSync("./samples/sample-voteorder.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/any_tag.json", "utf8"));
fs.writeFileSync("./samples/rules/any_tag.yml", yaml.safeDump(obj));*/

obj = JSON.parse(fs.readFileSync("./samples/rules/family-friendly_dlive.json", "utf8"));
fs.writeFileSync("./samples/rules/family-friendly_dlive.yml", yaml.safeDump(obj));

/*obj = JSON.parse(fs.readFileSync("./samples/rules/flag.json", "utf8"));
fs.writeFileSync("./samples/rules/flag.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/moderation-team.json", "utf8"));
fs.writeFileSync("./samples/rules/moderation-team.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/only-posts-with-pending-payout.json", "utf8"));
fs.writeFileSync("./samples/rules/only-posts-with-pending-payout.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/polish_tesla.json", "utf8"));
fs.writeFileSync("./samples/rules/polish_tesla.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/polish_tesla_or_elonmusk.json", "utf8"));
fs.writeFileSync("./samples/rules/polish_tesla_or_elonmusk.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/self-boost.json", "utf8"));
fs.writeFileSync("./samples/rules/self-boost.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/warm-welcome.json", "utf8"));
fs.writeFileSync("./samples/rules/warm-welcome.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/rules/weight-limiting.json", "utf8"));
fs.writeFileSync("./samples/rules/weight-limiting.yml", yaml.safeDump(obj));

obj = JSON.parse(fs.readFileSync("./samples/guest123.settings.json", "utf8"));
fs.writeFileSync("./samples/rules/guest123.config.yml", yaml.safeDump(obj));

|*/