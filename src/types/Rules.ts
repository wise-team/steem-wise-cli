import { SetRules } from "steem-wise-core";

export type Rules = Array<{
    rules: SetRules,
    voter: string,
}>;
