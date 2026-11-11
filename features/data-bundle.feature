@FeartureMobileDataBundles
Feature: Purchasing mobile data bundles

As a customer
I want to buy mobile data bundles using my wallet
So that I can purchase data and see my remaining balance

@SuccessfullyPurchase
Scenario Outline: Successfully purchase a data bundle
Given I have R500.00 in my wallet
When I purchase the "<bundle>" data bundle for "<mobileNumber>"
Then my data bundle purchase should be successful
And I should see the purchase reference
And my wallet balance should be R<expectedBalance>
And the purchase should be recorded for "<mobileNumber>" in the API

Examples:
| case    | mobileNumber | bundle | expectedBalance |
| DBP-000 | 0821234567   | 1GB    | 401.00          |

@BundlesInVisit
Scenario: Purchase two data bundles in one visit
Given I have R500.00 in my wallet
When I purchase the following data bundles:
| mobileNumber | bundle |
| 0821234567   | 1GB    |
| 0831234567   | 2GB    |
Then both data bundle purchases should be successful
And each purchase should have a reference
And my wallet balance should be R252.00
And both purchases should be recorded in the API


@PurchaseLimit
Scenario: Reach the daily purchase limit
Given I have R500.00 in my wallet
And I have already purchased 3 data bundles today
When I attempt to purchase the "1GB" data bundle for "0821234567"
Then my purchase should be rejected
And I should be told "You can buy up to 3 data bundles a day"
And the API should reject the purchase
And my wallet balance should remain R335.00
