-- 分类初始化数据
-- 执行命令: wrangler d1 execute qdesign-db --local --file=./scripts/seed-categories.sql

INSERT OR IGNORE INTO categories (id, name, slug, description, icon, display_order, created_at) VALUES
('cat_clothing', '衣服', 'clothing', '服装类3D模型，包括上衣、裤子、裙子等', 'shirt', 1, strftime('%s', 'now') * 1000),
('cat_vehicle', '车辆', 'vehicle', '汽车、摩托车、自行车等交通工具模型', 'car', 2, strftime('%s', 'now') * 1000),
('cat_packaging', '包装盒', 'packaging', '产品包装设计，礼盒、纸盒等', 'box', 3, strftime('%s', 'now') * 1000),
('cat_cosmetics', '化妆品', 'cosmetics', '化妆品容器、瓶子、管子等', 'sparkles', 4, strftime('%s', 'now') * 1000),
('cat_footwear', '鞋类', 'footwear', '运动鞋、皮鞋、凉鞋等各类鞋子', 'footprints', 5, strftime('%s', 'now') * 1000),
('cat_3dprint', '3D打印', '3d-printing', '适用于3D打印的模型', 'printer', 6, strftime('%s', 'now') * 1000),
('cat_furniture', '家具', 'furniture', '桌椅、沙发、床等家具模型', 'armchair', 7, strftime('%s', 'now') * 1000),
('cat_electronics', '电子产品', 'electronics', '手机、电脑、耳机等电子设备', 'smartphone', 8, strftime('%s', 'now') * 1000),
('cat_other', '其他', 'other', '其他类型的3D模型', 'folder', 99, strftime('%s', 'now') * 1000);
