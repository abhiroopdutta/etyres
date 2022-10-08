import datetime
from models import Sale 

def prepare_b2b_report(start_date, end_date):
    start_datetime = datetime.datetime.strptime(start_date + " " + "00:00:00", '%Y-%m-%d %H:%M:%S')
    end_datetime = datetime.datetime.strptime(end_date + " " + "23:59:59", '%Y-%m-%d %H:%M:%S')

    b2b_data_pipeline = [
        # Stage 1: Filter invoices according to date range, invoiceStatus = "paid", GST customers
        {
           "$match":
            {
                "invoiceDate": { "$gte": start_datetime, "$lte": end_datetime },
                "invoiceStatus": "paid",
                "customerDetails.GSTIN": { "$ne": "" } 
            }
        },
        # Stage 2: Concat products[]+services[] to form items, drop unnecessary fields
        { 
            "$project": 
            {   
                "_id": 0,
                "invoiceNumber": 1,
                "invoiceDate": 1,
                "invoiceTotal": 1,
                "customerName": "$customerDetails.name",
                "customerGSTIN": "$customerDetails.GSTIN",
                "items": { "$concatArrays": [ "$productItems", "$serviceItems" ] }
            } 
        },
        # Stage 3: Unwind (denormalize) items list
        {
            "$unwind" : "$items" 
        },
        # Stage 4: Compute new fields (taxable value, item rate), drop unnecessary fields from items
        { 
            "$project": 
            {   
                "invoiceNumber": 1,
                "invoiceDate": 1,
                "invoiceTotal": 1,
                "customerName": 1,
                "customerGSTIN": 1,

                #new computed fields from items
                #even though IGST may not exist in service items, it still works, how?
                "itemRate": {"$multiply": [{ "$sum": [ "$items.CGST", "$items.SGST", "$items.IGST" ] }, 100.00]},
                "taxableValue": { "$multiply": [ "$items.ratePerItem", "$items.quantity" ] }
            } 
        },
        # Stage 5: Create 2 branches, one for invoices (above data) and one for summary
        {
            "$facet": {
                "b2bInvoices": [{
                    "$project": {   
                        "invoiceNumber": 1,
                        "invoiceDate": 1,
                        "invoiceTotal": 1,
                        "customerName": 1,
                        "customerGSTIN": 1,
                        "itemRate": 1,
                        "taxableValue": 1
                    } 
                }],

                "countUniqB2bCustomer": [
                    {
                        "$group": {
                        "_id": "$customerGSTIN",
                        }
                    },
                    {
                        "$count": "value"
                    }
                ],
                "countUniqB2bInvoices": [
                    {
                        "$group": {
                        "_id": "$invoiceNumber",
                        }
                    },
                    {
                        "$count": "value"
                    }
                ],
                "sumInvoiceTotal": [
                    {
                        "$group": {
                        "_id": {"invoiceNumber": "$invoiceNumber", "invoiceTotal": "$invoiceTotal"},
                        }
                    },
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$_id.invoiceTotal"}
                        }
                    }
                ],
                "sumTaxableValue": [
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$taxableValue"}
                        }
                    }
                ],

            }
        }
    ]

    b2c_data_pipeline = [
        # Stage 1: Filter invoices according to date range, invoiceStatus = "paid", non GST customers
        {
           "$match":
            {
                "invoiceDate": { "$gte": start_datetime, "$lte": end_datetime },
                "invoiceStatus": "paid",
                "customerDetails.GSTIN": { "$eq": "" } 
            }
        },
        # Stage 2: Concat products[]+services[] to form items, drop unnecessary fields
        { 
            "$project": 
            {   
                "_id": 0,
                "items": { "$concatArrays": [ "$productItems", "$serviceItems" ] }
            } 
        },
        # Stage 3: Unwind (denormalize) items list
        {
            "$unwind" : "$items" 
        },
        # Stage 4: Compute new fields (taxable value, item rate), drop unnecessary fields from items
        { 
            "$project": 
            {   
                #new computed fields from items
                #even though IGST may not exist in service items, it still works, how?
                "itemRate": {"$multiply": [{ "$sum": [ "$items.CGST", "$items.SGST", "$items.IGST" ] }, 100.00]},
                "taxableValue": { "$multiply": [ "$items.ratePerItem", "$items.quantity" ] }
            } 
        },
        # Stage 5: Group by rate, sum (taxableValue)
        {
            "$group": 
            {
                "_id": "$itemRate",
                "taxableValue": { "$sum": "$taxableValue"}
            }
        },
        # Stage 6: Create 2 branches, one for invoices (above data) and one for summary
        {
            "$facet": {
                "b2cInvoices": [{
                    "$project": {
                        "_id": 0,   
                        "rate": "$_id",
                        "taxableValue": 1
                    } 
                }],

                "sumTaxableValue": [
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$taxableValue"}
                        }
                    }
                ],

            }
        }
    ]
    
    hsn_data_pipeline = [
        # Stage 1: Filter invoices according to date range, invoiceStatus = "paid"
        {
           "$match":
            {
                "invoiceDate": { "$gte": start_datetime, "$lte": end_datetime },
                "invoiceStatus": "paid",
            }
        },
        # Stage 2: Concat products[]+services[] to form items, drop unnecessary fields
        { 
            "$project": 
            {   
                "_id": 0,
                "items": { "$concatArrays": [ "$productItems", "$serviceItems" ] }
            } 
        },
        # Stage 3: Unwind (denormalize) items list
        {
            "$unwind" : "$items" 
        },
        # Stage 4: Fill IGST values with 0.00 for service items that don't have IGST field 
        {
            "$fill":
            {
            "output":
                {
                    "items.IGST": { "value": 0.00 }
                }
            }
        },
        # Stage 5: Compute new fields (taxable value, item rate), drop unnecessary fields from items
        { 
            "$project": 
            {   
                #new computed fields from items
                #even though IGST may not exist in service items, it still works, how?
                "hsn": "$items.HSN",
                "rate": {"$round": [{"$multiply": [{ "$sum": [ "$items.CGST", "$items.SGST", "$items.IGST" ] }, 100.00]}, 2]},
                "quantity": "$items.quantity",
                "taxableValue": {"$round": [{ "$multiply": [ "$items.ratePerItem", "$items.quantity" ] }, 2]},
                "CGST": "$items.CGST",
                "SGST": "$items.SGST",
                "IGST": "$items.IGST",
            } 
        },
        # Stage 6: Compute new fields (CGST, SGST, IGST Amount)
        { 
            "$project": 
            {   
                #new computed fields from items
                #even though IGST may not exist in service items, it still works, how?
                "hsn": 1,
                "rate": 1,
                "quantity": 1,
                "taxableValue": 1,
                "CGSTAmount": {"$round": [{"$multiply": ["$CGST", "$taxableValue"]}, 2]},
                "SGSTAmount": {"$round": [{"$multiply": ["$SGST", "$taxableValue"]}, 2]},
                "IGSTAmount": {"$round": [{"$multiply": ["$IGST", "$taxableValue"]}, 2]},
            } 
        },
        # Stage 7: Group by hsn, sum (CGST), sum(SGST), sum(IGST)
        {
            "$group": 
            {
                "_id": {"hsn": "$hsn", "rate": "$rate"},
                "quantity": { "$sum": "$quantity"},
                "taxableValue": { "$sum": "$taxableValue"},
                "CGSTAmount": { "$sum": "$CGSTAmount"},
                "SGSTAmount": { "$sum": "$SGSTAmount"},
                "IGSTAmount": { "$sum": "$IGSTAmount"},
            }
        },
        # Stage 8: Create 2 branches, one for invoices (above data) and one for summary
        {
            "$facet": {
                "hsnData": [{
                    "$project": {
                        "_id": 0,   
                        "hsn": "$_id.hsn",
                        "rate": "$_id.rate",
                        "quantity": 1,
                        "taxableValue": 1,
                        "CGSTAmount": 1,
                        "SGSTAmount": 1,
                        "IGSTAmount": 1,
                    } 
                }],

                "countUniqHSN": [
                    {
                        "$count": "value"
                    }
                ],
                "sumTaxableValue": [
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$taxableValue"}
                        }
                    }
                ],
                "sumCGSTAmount": [
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$CGSTAmount"}
                        }
                    }
                ],
                "sumSGSTAmount": [
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$SGSTAmount"}
                        }
                    }
                ],
                "sumIGSTAmount": [
                    {
                        "$group": {
                        "_id": "null",
                        "value": { "$sum": "$IGSTAmount"}
                        }
                    }
                ]

            }
        }
    
    ]

    b2b_data = Sale.objects().aggregate(hsn_data_pipeline)
    
    for data in b2b_data:
        print(data)    