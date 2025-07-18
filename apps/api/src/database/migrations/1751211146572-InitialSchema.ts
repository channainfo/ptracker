import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1751211146572 implements MigrationInterface {
    name = 'InitialSchema1751211146572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and create enum types if they don't exist
        const roleEnumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'users_role_enum'
        `);
        
        if (roleEnumExists.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'moderator', 'admin')`);
        }
        
        const tierEnumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'users_tier_enum'
        `);
        
        if (tierEnumExists.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."users_tier_enum" AS ENUM('novice', 'learner', 'trader', 'expert', 'master', 'legend')`);
        }
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "password" character varying, "first_name" character varying, "last_name" character varying, "wallet_address" character varying, "wallet_network" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "tier" "public"."users_tier_enum" NOT NULL DEFAULT 'novice', "email_verified" boolean NOT NULL DEFAULT false, "email_verification_token" character varying, "password_reset_token" character varying, "password_reset_expiry" TIMESTAMP, "refresh_token" character varying, "auth_provider" character varying, "auth_provider_id" character varying, "two_factor_enabled" boolean NOT NULL DEFAULT false, "two_factor_secret" character varying, "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP, "login_count" integer NOT NULL DEFAULT '0', "profile_picture" character varying, "bio" text, "timezone" character varying, "language" character varying, "notification_preferences" jsonb, "privacy_settings" jsonb, "knowledge_score" integer NOT NULL DEFAULT '0', "investment_score" integer NOT NULL DEFAULT '0', "reputation_score" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_196ef3e52525d3cd9e203bdb1de" UNIQUE ("wallet_address"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7038d44154f0e1c8213352b403" ON "users" ("wallet_address") WHERE wallet_address IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_65cbf5fcb331619593ee334c7c" ON "users" ("email") WHERE email IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "portfolios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "userId" uuid NOT NULL, "totalValue" numeric(20,8) NOT NULL DEFAULT '0', "baseCurrency" character varying(10) NOT NULL DEFAULT 'USD', "isActive" boolean NOT NULL DEFAULT true, "isPublic" boolean NOT NULL DEFAULT false, "settings" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_488aa6e9b219d1d9087126871ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bda8b3b33ae4548448cc0535fc" ON "portfolios" ("userId", "isActive") `);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT', 'DIVIDEND', 'STAKING_REWARD')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "holdingId" uuid NOT NULL, "symbol" character varying(20) NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "quantity" numeric(20,8) NOT NULL, "price" numeric(15,8) NOT NULL, "total" numeric(20,8) NOT NULL, "fees" numeric(15,8) NOT NULL DEFAULT '0', "currency" character varying(10) NOT NULL DEFAULT 'USD', "source" character varying(20) NOT NULL DEFAULT 'MANUAL', "externalId" character varying(100), "notes" character varying(200), "executedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3934dcdf81c21581c8ecd66279" ON "transactions" ("symbol", "executedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_ac6477220567face635ee0a904" ON "transactions" ("executedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_64d7da1c653c2f4bd036f417ab" ON "transactions" ("holdingId", "type") `);
        await queryRunner.query(`CREATE TABLE "portfolio_holdings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "portfolioId" uuid NOT NULL, "symbol" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "quantity" numeric(20,8) NOT NULL DEFAULT '0', "averagePrice" numeric(15,8) NOT NULL DEFAULT '0', "totalCost" numeric(20,8) NOT NULL DEFAULT '0', "currentPrice" numeric(15,8), "currentValue" numeric(20,8), "profitLoss" numeric(10,4), "profitLossPercentage" numeric(8,4), "source" character varying(20) NOT NULL DEFAULT 'MANUAL', "externalId" character varying(50), "isActive" boolean NOT NULL DEFAULT true, "lastPriceUpdate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_791e8293470395842404d51142f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2632abf3305c87cbd0a37f323a" ON "portfolio_holdings" ("symbol", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_b69af20373681a33c450d64253" ON "portfolio_holdings" ("portfolioId", "symbol") `);
        await queryRunner.query(`ALTER TABLE "portfolios" ADD CONSTRAINT "FK_e4e66691a2634fcf5525e33ecf5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_992185d0ef0eb0d5a387cf57846" FOREIGN KEY ("holdingId") REFERENCES "portfolio_holdings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "FK_65b5e59d80a8a0fd9044c1ea32c" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio_holdings" DROP CONSTRAINT "FK_65b5e59d80a8a0fd9044c1ea32c"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_992185d0ef0eb0d5a387cf57846"`);
        await queryRunner.query(`ALTER TABLE "portfolios" DROP CONSTRAINT "FK_e4e66691a2634fcf5525e33ecf5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b69af20373681a33c450d64253"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2632abf3305c87cbd0a37f323a"`);
        await queryRunner.query(`DROP TABLE "portfolio_holdings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_64d7da1c653c2f4bd036f417ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ac6477220567face635ee0a904"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3934dcdf81c21581c8ecd66279"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bda8b3b33ae4548448cc0535fc"`);
        await queryRunner.query(`DROP TABLE "portfolios"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65cbf5fcb331619593ee334c7c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7038d44154f0e1c8213352b403"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_tier_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
