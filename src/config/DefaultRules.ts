import { SetRulesForVoter, TagsRule, VotingPowerRule, WeightForPeriodRule, WeightRule } from "steem-wise-core";

export class DefaultRules {
    public static DEFAULT_RULES: SetRulesForVoter [] = [
        {
            voter: "wise-test",
            rulesets: [
                {
                    name: "Support to Steem WISE",
                    rules: [
                        new WeightRule(0, 5000),
                        new WeightForPeriodRule(7, WeightForPeriodRule.PeriodUnit.DAY, 20000),
                        new VotingPowerRule(VotingPowerRule.Mode.MORE_THAN, 9000),
                        new TagsRule(TagsRule.Mode.ANY, [ "wise", "pl-wise" ]),
                    ],
                },
            ],
        },
        {
            voter: "someone-you-love",
            rulesets: [
                {
                    name: "Do anythink you want",
                    rules: [],
                },
            ],
        },
    ];
}
