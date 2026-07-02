# -*- coding: utf-8 -*-
"""
Generate Sequence Diagrams:
  1. Customer Checkout Flow (add-to-cart -> payment)
  2. Admin Process Order Flow (status update -> notifications)
"""
import urllib.request, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

diagrams = {
    "SEQ_1_Customer_Checkout": """
@startuml
skinparam monochrome false
skinparam sequenceArrowThickness 2
skinparam roundcorner 8
skinparam participantBackgroundColor #EFF6FF
skinparam participantBorderColor #3B82F6
skinparam actorBackgroundColor #DBEAFE
skinparam sequenceGroupBackgroundColor #F0FDF4
skinparam noteBorderColor #F59E0B
skinparam noteBackgroundColor #FFFBEB
skinparam lifelineBorderColor #93C5FD
skinparam sequenceDividerBackgroundColor #E0F2FE
skinparam sequenceArrowColor #1D4ED8
skinparam sequenceLifeLineBorderColor #93C5FD

title Sequence Diagram: Customer Checkout & Payment Flow

actor "Customer" as C
participant "Storefront\\n(Next.js)" as UI
participant "Cart API" as CA
participant "Order API" as OA
participant "Payment\\nGateway" as PG
participant "Inventory\\nService" as IS
database "Supabase\\n(PostgreSQL)" as DB

== Add to Cart ==
C -> UI: Click "Add to Cart"
UI -> CA: POST /api/cart/items\\n{variant_id, qty}
CA -> DB: Check stock_qty (product_variants)
DB --> CA: stock_qty = 15
CA -> DB: INSERT cart_items
DB --> CA: cart_item created
CA --> UI: 200 OK {cartCount}
UI --> C: Cart badge updated (+1)

== Checkout ==
C -> UI: Click "Checkout"
UI -> CA: GET /api/cart
CA -> DB: SELECT cart_items JOIN product_variants
DB --> CA: items with price & stock
CA --> UI: CartSummary {items, subtotal}
UI --> C: Review Order page

C -> UI: Enter shipping address\\n+ Select payment method
C -> UI: Click "Place Order"
UI -> OA: POST /api/orders\\n{items, address, payment_method}

== Optimistic Concurrency Check ==
group Race Condition Prevention
  OA -> DB: BEGIN TRANSACTION
  OA -> IS: Reserve stock\\n(stock_qty -= qty\\nWHERE version = current_version)
  IS -> DB: UPDATE product_variants\\nSET stock_qty=stock_qty-qty,\\nversion=version+1\\nWHERE id=? AND version=?
  DB --> IS: rows_affected = 1 (success)
  IS --> OA: Stock reserved OK
  OA -> DB: INSERT orders + order_items
  OA -> DB: COMMIT
end

OA -> PG: Create payment session\\n{amount, order_id, return_url}
PG --> OA: {payment_url, session_id}
OA -> DB: INSERT payments (status=pending)
OA --> UI: 201 Created {order_id, payment_url}

== Payment Processing ==
UI -> C: Redirect to payment page
C -> PG: Complete payment\\n(card/VNPay/MoMo)
PG -> OA: IPN Webhook POST\\n{order_id, status=paid}
OA -> DB: UPDATE payments SET status=paid
OA -> DB: UPDATE orders SET status=confirmed
OA --> PG: 200 Acknowledged

PG --> C: Redirect back to success page
UI --> C: Order confirmation page\\n{order_number, ETA}

@enduml
""",

    "SEQ_2_Admin_Order_Management": """
@startuml
skinparam monochrome false
skinparam sequenceArrowThickness 2
skinparam roundcorner 8
skinparam participantBackgroundColor #F0FDF4
skinparam participantBorderColor #16A34A
skinparam actorBackgroundColor #DCFCE7
skinparam sequenceGroupBackgroundColor #EFF6FF
skinparam noteBorderColor #F59E0B
skinparam noteBackgroundColor #FFFBEB
skinparam lifelineBorderColor #86EFAC
skinparam sequenceArrowColor #15803D
skinparam sequenceLifeLineBorderColor #86EFAC

title Sequence Diagram: Admin Order Processing & Notification Flow

actor "Admin" as A
participant "Admin Dashboard\\n(Next.js)" as AD
participant "Order API" as OA
participant "Notification\\nService" as NS
participant "Email Service\\n(Resend)" as ES
database "Supabase\\n(PostgreSQL)" as DB

== View Pending Orders ==
A -> AD: Open Orders page
AD -> OA: GET /api/admin/orders\\n?status=confirmed
OA -> DB: SELECT orders JOIN profiles\\nWHERE status IN (pending, confirmed)\\nORDER BY created_at DESC
DB --> OA: orders[]
OA --> AD: 200 OK {orders[]}
AD --> A: Orders table rendered\\n(filterable, sortable)

== Update Order Status ==
A -> AD: Click order row
AD --> A: Order Detail modal\\n{items, customer, address, timeline}
A -> AD: Select "Shipping" from dropdown
AD -> AD: Confirm dialog shown
A -> AD: Click "Confirm Update"

AD -> OA: PATCH /api/admin/orders/{id}\\n{status: "shipping"}

group Atomic Status Update
  OA -> DB: BEGIN TRANSACTION
  OA -> DB: SELECT order (lock for update)
  DB --> OA: order {current_status: "confirmed"}
  OA -> OA: Validate transition\\n(confirmed -> shipping: VALID)
  OA -> DB: UPDATE orders\\nSET status="shipping",\\nupdated_at=now()
  OA -> DB: INSERT order_status_logs\\n{from: confirmed, to: shipping}
  OA -> DB: INSERT admin_audit_logs\\n{actor_id, action: UPDATE_ORDER_STATUS}
  OA -> DB: COMMIT
end

OA --> AD: 200 OK {updated_order}
AD --> A: Status badge updated (green "Shipping")

== Send Customer Notification ==
OA -> NS: Emit order.status_changed event\\n{order_id, customer_id, new_status}

NS -> DB: SELECT profiles WHERE user_id = customer_id
DB --> NS: {email, full_name}

NS -> DB: SELECT email_templates\\nWHERE type = "ORDER_SHIPPING"
DB --> NS: {subject, body_template}

NS -> NS: Render template\\n(inject: order_number, name, tracking)

NS -> ES: POST /emails/send\\n{to, subject, html_body}
ES --> NS: 202 Accepted {email_id}

NS -> DB: INSERT admin_notifications\\n{type: "order_shipped", entity_id: order_id}
NS --> OA: Notification sent OK

== Admin Inbox Update ==
DB --> AD: Realtime push via Supabase\\nsubscribe(admin_notifications)
AD --> A: Bell icon badge (+1)\\nToast: "Email sent to customer"

note over A, DB
  Full audit trail preserved:
  - order_status_logs (immutable history)
  - admin_audit_logs (who changed what, when)
end note

@enduml
"""
}

for name, puml in diagrams.items():
    print(f"Generating {name}...")
    try:
        req = urllib.request.Request(
            'https://kroki.io/plantuml/png',
            data=puml.strip().encode('utf-8'),
            method='POST'
        )
        req.add_header('Content-Type', 'text/plain')
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
        fname = f"{name}.png"
        with open(fname, 'wb') as f:
            f.write(data)
        print(f"  Saved: {fname} ({len(data):,} bytes)")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\nDone!")
