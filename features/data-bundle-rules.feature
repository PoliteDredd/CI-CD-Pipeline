@FeatureValidateBundle
Feature: Validate data bundle purchases

As a customer
I want my data bundle purchase details to be validated
So that invalid purchases are rejected with the correct message

Scenario Outline: Validate a data bundle purchase
Given I create an API wallet with R<balance>.00
And the API wallet has already purchased <previousPurchases> data bundles today
When I submit an API purchase for "<bundle>" to "<mobileNumber>"
Then the API purchase should be "<expectedResult>"
And the API should return the message "<expectedMessage>"

@smoke
Examples: Accepted
| case    | mobileNumber | bundle | previousPurchases | balance | expectedResult | expectedMessage              |
| DBP-001 | 0821234567   | 1GB    | 0                 | 500     | Accepted       | 1GB data bundle purchased    |
| DBP-002 | 0712345678   | 2GB    | 1                 | 500     | Accepted       | 2GB data bundle purchased    |
| DBP-002 | 0712345678   | 2GB    | 2                 | 500     | Accepted       | 2GB data bundle purchased    |

@negative 
Examples: Rejected
| case    | mobileNumber | bundle | previousPurchases | balance | expectedResult | expectedMessage                          |
| DBP-003 | 082123456    | 1GB    | 0                 | 500     | Rejected       | Enter a valid SA mobile number            |
| DBP-004 | 08212345678  | 1GB    | 0                 | 500     | Rejected       | Enter a valid SA mobile number            |
| DBP-005 | 0821234567   |        | 0                 | 500     | Rejected       | Choose a data bundle                      |
| DBP-006 | 0821234567   | 1GB    | 3                 | 500     | Rejected       | You can buy up to 3 data bundles a day    |
| DBP-007 | 0821234567   | 10GB   | 0                 | 100     | Rejected       | Not enough funds in your Flash wallet     |
| DBP-008 | +27821234567 | 1GB    | 0                 | 500     | Rejected       | Enter a valid SA mobile number            |
| DBP-009 | 082 123 4567 | 1GB    | 0                 | 500     | Rejected       | Enter a valid SA mobile number            |
