# Glossary

### Subscription

Subscription is any regular, predictable in advance expense, not only what is usually meant by the term "subscription" like Netflix or Spotify subscriptions. Apartment rent - is a subscription, health insurance - is a subscription, gift for friend's birthday - is also a subscription. Disregard of is it billed from credit cart automatically or the user should each time make manual transaction like a bank transfer if it regular and predictable - it is a subscription. This will allow to really see how much of an income is a netto money.

Currently subscription consists of the following fields:

- name (required)
- description (optional)
- icon (required)
- price (required)
- start date (required, default is today)
- end date (optional)
- billing cycle consisting from two fields: period and each (required, default is «once each month»)
- category (optional)

### Category

Category is a way to organize subscriptions into groups by some trait.

Categories themselves can be categorized as well as subscriptions: for example there might be a common category of "housing" and two sub categories like "housing/utility bills" and "housing/rent". This allows user to drill-down into his/her expenses: by default some chart can show data grouped by root categories, but if user clicks on one of those root categories, chart now is able to show the data based on child categories of clicked root category.

Currently category consists of the following fields:

- name (required)
- color (required)
