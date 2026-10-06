# API Call Flow - Clean Architecture

> Sign-in is a wallet connection, profiles are stored in Convex, and USDC payments settle on Arc. See [Arc payments](../../docs/ARC_INTEGRATION.md).

## Complete Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Integration    │    │   API Layer     │    │   External      │
│   Component     │    │   Service        │    │                 │    │   API           │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │ 1. User clicks       │                       │                       │
         │    "Register"        │                       │                       │
         │─────────────────────▶│                       │                       │
         │                       │                       │                       │
         │                       │ 2. Call stablecoin    │                       │
         │                       │    API service        │                       │
         │                       │─────────────────────▶│                       │
         │                       │                       │                       │
         │                       │                       │ 3. HTTP request       │
         │                       │                       │    to Next.js API     │
         │                       │                       │─────────────────────▶│
         │                       │                       │                       │
         │                       │                       │ 4. Forward to         │
         │                       │                       │    external API       │
         │                       │                       │─────────────────────▶│
         │                       │                       │                       │
         │                       │                       │                       │ 5. Create user
         │                       │                       │                       │    in database
         │                       │                       │                       │
         │                       │                       │                       │◀─────────────────
         │                       │                       │                       │
         │                       │                       │ 6. Return user data   │
         │                       │                       │◀─────────────────────│
         │                       │                       │                       │
         │                       │ 7. Activate payment   │                       │
         │                       │    for user           │                       │
         │                       │─────────────────────▶│                       │
         │                       │                       │                       │
         │                       │                       │ 8. Call activate-pay  │
         │                       │                       │    endpoint           │
         │                       │                       │─────────────────────▶│
         │                       │                       │                       │
         │                       │                       │                       │ 9. Enable gas
         │                       │                       │                       │    payment
         │                       │                       │                       │
         │                       │                       │                       │◀─────────────────
         │                       │                       │                       │
         │                       │                       │ 10. Return success    │
         │                       │                       │◀─────────────────────│
         │                       │                       │                       │
         │                       │ 11. Return stablecoin │                       │
         │                       │    user data          │                       │
         │                       │◀──────────────────────│                       │
         │                       │                       │                       │
         │ 12. Update Convex     │                       │                       │
         │    database          │                       │                       │
         │◀─────────────────────│                       │                       │
         │                       │                       │                       │
```

## Detailed Step-by-Step Flow

### 1. **Client Component** (`UserRegistration.tsx`)
```typescript
// User clicks "Complete Registration" button
const handleSubmit = async (e: React.FormEvent) => {
    const integrationResult = await userIntegrationService.completeUserIntegration({
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: formData.firstName,
        lastName: formData.lastName,
    });
};
```

### 2. **Integration Service** (`user-integration.service.ts`)
```typescript
async completeUserIntegration(userData: UserIntegrationData): Promise<IntegrationResult> {
    // Step 1: Create user in stablecoin system
    const result = await this.createStablecoinUser(userData);
    
    // Step 2: Activate payment for the user
    await this.activatePayment(result.stablecoinUser.id);
    
    // Step 3: Return data for Convex update
    return {
        success: true,
        stablecoinUser: result.stablecoinUser,
    };
}
```

### 3. **API Service** (`stablecoin-api.ts`)
```typescript
// Create user
async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await this.httpClient.post<CreateUserResponse>('/users', userData);
    return response;
}

// Activate payment
async activatePayment(userId: string): Promise<void> {
    await this.httpClient.post(`/activate-pay/${userId}`);
}
```

### 4. **Next.js API Routes**
```typescript
// /api/stablecoin/users.ts - Create user
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userData = await createUserInExternalApi({ email, firstName, lastName });
    return res.status(200).json(userData);
}

// /api/stablecoin/activate-pay/[userId].ts - Activate payment
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;
    await stablecoinApi.post(`/activate-pay/${userId}`);
    return res.status(200).json({ message: 'Payment activated successfully' });
}
```

### 5. **External Stablecoin API**
```typescript
// Create user
POST https://seal-app-qp9cc.ondigitalocean.app/api/v1/users
Body: { email, firstName, lastName }
Response: { id, email, firstName, lastName, publicKey, paymentIdentifier }

// Activate payment
POST https://seal-app-qp9cc.ondigitalocean.app/api/v1/activate-pay/{userId}
Headers: { Authorization: Bearer {API_KEY} }
Response: { message: "Payment activated successfully" }
```

### 6. **Convex Database Update**
```typescript
// Update user profile with stablecoin data
const convexResult = await createUserWithStablecoinIntegration({
    clerkUserId: user.id,
    // ... other user data
    liskId: integrationResult.stablecoinUser?.id,
    publicKey: integrationResult.stablecoinUser?.publicKey,
    paymentIdentifier: integrationResult.stablecoinUser?.paymentIdentifier,
});
```

## 🔄 **Complete Registration Flow**

### **Step 1: Create User in Stablecoin System**
- **Input**: User data (email, firstName, lastName)
- **Output**: Stablecoin user with payment identifiers

### **Step 2: Activate Payment**
- **Input**: User ID from step 1
- **Output**: Payment activation confirmation
- **Purpose**: Enable gas payment for the user

### **Step 3: Update Convex Database**
- **Input**: Complete user data + stablecoin data
- **Output**: User profile stored in Convex database

## 🛡️ **Error Handling**

### **Payment Activation Failure**
- If payment activation fails, user creation still continues
- Payment can be activated later manually
- User gets a warning but registration completes

### **User Creation Failure**
- If user creation fails, entire registration stops
- User gets clear error message
- No partial data is saved

## 🎯 **Key Benefits**

1. **Complete Onboarding**: Users are fully set up with payment capabilities
2. **Fault Tolerance**: Registration continues even if payment activation fails
3. **Clear Flow**: Each step is clearly defined and logged
4. **Error Recovery**: Failed payment activation doesn't block user creation
5. **One-Time Setup**: Payment activation happens only during registration

## 📊 **Success Metrics**

- ✅ User created in stablecoin system
- ✅ Payment activated for user
- ✅ User profile saved in Convex database
- ✅ User redirected to dashboard

This architecture ensures a complete user onboarding experience with payment activation! 🚀 