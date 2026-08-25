CREATE TABLE `potatoOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketCode` varchar(4) NOT NULL,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`receivedAt` bigint unsigned NOT NULL,
	`completedAt` bigint unsigned,
	CONSTRAINT `potatoOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `potatoOrders_ticketCode_unique` UNIQUE(`ticketCode`)
);
