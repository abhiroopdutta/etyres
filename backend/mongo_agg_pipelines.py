import datetime
from models import Sale 

def prepare_gstr1_report(start_date, end_date):
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
                "itemRate": {"$round": [{"$multiply": [{ "$sum": [ "$items.CGST", "$items.SGST", "$items.IGST" ] }, 100.00]}, 2]},
                "taxableValue": {"$round": [{ "$multiply": [ "$items.ratePerItem", "$items.quantity" ] }, 2]}
            } 
        },
        # Stage 5 : Sort by invoiceNumber
        {   
            "$sort": { "invoiceNumber": 1} 
        },
        # Stage 6: Group by invoiceNumber and itemRate, sum(taxableValue)
        {
            "$group": {
            "_id": {
                "invoiceNumber": "$invoiceNumber", 
                "itemRate": "$itemRate"
                },
            "invoiceDate": {"$first": "$invoiceDate"},
            "invoiceTotal": {"$first": "$invoiceTotal"},
            "customerName": {"$first": "$customerName"},
            "customerGSTIN": {"$first": "$customerGSTIN"},
            "taxableValue": { "$sum": "$taxableValue"}
            }
        },
        # Stage 7 : Sort by invoiceDate
        {   
            "$sort": { "invoiceDate": 1} 
        },
        # Stage 8: Project stage for reformatting data for further stages
        {
            "$project": {   
                "_id": 0,
                "invoiceNumber": "$_id.invoiceNumber",
                "invoiceDate": "$invoiceDate",
                "invoiceTotal": "$invoiceTotal",
                "customerName": "$customerName",
                "customerGSTIN": "$customerGSTIN",
                "itemRate": "$_id.itemRate",
                "taxableValue": "$taxableValue"
            } 
        },
        # Stage 9 : Create 2 branches, one for invoices (above data) and one for summary
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
                "itemRate": {"$round": [{"$multiply": [{ "$sum": [ "$items.CGST", "$items.SGST", "$items.IGST" ] }, 100.00]}, 2]},
                "taxableValue": {"$round": [{ "$multiply": [ "$items.ratePerItem", "$items.quantity" ] }, 2]}
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
                "hsnItems": [{
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

    docs_data_pipeline = [
        {
            "$match": {
                "invoiceDate": { "$gte": start_datetime, "$lte": end_datetime },
            }
        },
        {
            "$facet": {
                "minInvoiceNumber": [
                    {
                        "$group": {
                            "_id": "null",
                            "value": { "$min": "$invoiceNumber" },
                        }
                    },
                ],
                "maxInvoiceNumber": [
                    {
                        "$group": {
                            "_id": "null",
                            "value": { "$max": "$invoiceNumber" }
                        }
                    },
                ],
                "paidInvoicesCount": [
                    {
                        "$match":{"invoiceStatus": "paid",}
                    },
                    {
                        "$count": "value"
                    }
                ],
                "cancelledInvoicesCount": [
                    {
                        "$match":{"invoiceStatus": "cancelled",}
                    },
                    {
                        "$count": "value"
                    }
                ]
            }
        }
    ]

    b2b_data = list(Sale.objects().aggregate(b2b_data_pipeline))[0]
    b2c_data = list(Sale.objects().aggregate(b2c_data_pipeline))[0]
    hsn_data = list(Sale.objects().aggregate(hsn_data_pipeline))[0]
    docs_data = list(Sale.objects().aggregate(docs_data_pipeline))[0]
    return {
        "b2bData": {
            "b2bSummary": {
                "countUniqB2bCustomer": b2b_data["countUniqB2bCustomer"][0]["value"],
                "countUniqB2bInvoices": b2b_data["countUniqB2bInvoices"][0]["value"],
                "sumInvoiceTotal": b2b_data["sumInvoiceTotal"][0]["value"],
                "sumTaxableValue": b2b_data["sumTaxableValue"][0]["value"]
            },
            "b2bItems": b2b_data["b2bInvoices"]
        },
        "b2cData": {
            "b2cSummary": {
                "sumTaxableValue": b2c_data["sumTaxableValue"][0]["value"]
            },
            "b2cItems": b2c_data["b2cInvoices"]
        },
        "hsnData": {
            "hsnSummary": {
                "countUniqHSN": hsn_data["countUniqHSN"][0]["value"],
                "sumTaxableValue": hsn_data["sumTaxableValue"][0]["value"],
                "sumCGSTAmount": hsn_data["sumCGSTAmount"][0]["value"],
                "sumSGSTAmount": hsn_data["sumSGSTAmount"][0]["value"],
                "sumIGSTAmount": hsn_data["sumIGSTAmount"][0]["value"],
            },
            "hsnItems": hsn_data["hsnItems"]
        },
        "docsData": {
            "docsSummary": {
                "totalDocs": docs_data["paidInvoicesCount"][0]["value"],
                "totalcancelledDocs": docs_data["cancelledInvoicesCount"][0]["value"] if docs_data["cancelledInvoicesCount"] else 0

            },
            "docsItems": [{
                "minInvoiceNumber": docs_data["minInvoiceNumber"][0]["value"],
                "maxInvoiceNumber": docs_data["maxInvoiceNumber"][0]["value"],
                "paidInvoicesCount": docs_data["paidInvoicesCount"][0]["value"],
                "cancelledInvoicesCount": docs_data["cancelledInvoicesCount"][0]["value"] if docs_data["cancelledInvoicesCount"] else 0
            }],
        },   
    }