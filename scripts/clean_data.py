import csv
import json
import re
import os

def parse_heat(note_text):
    """从备注/成绩文本中解析热度相关数据"""
    heat_data = {}

    if not note_text:
        return heat_data

    text = str(note_text)

    # 红果热度 (主要热度指标)
    match = re.search(r'红果热度[\s]*([\d.]+)\s*[wW万]?', text)
    if match:
        heat_data['hongguo_heat'] = float(match.group(1))

    # 红果收藏
    match = re.search(r'红果收藏[\s]*([\d.]+)\s*[wW万]?', text)
    if match:
        heat_data['hongguo_fav'] = float(match.group(1))

    # 累计热力值
    match = re.search(r'累计热力值[\s]*([\d.]+)\s*[wW万]?', text)
    if match:
        heat_data['total_heat'] = float(match.group(1))

    # 累计播放
    match = re.search(r'累计播放[\s]*([\d.]+)\s*[wW万]?', text)
    if match:
        heat_data['total_play'] = float(match.group(1))

    # 快手播放
    match = re.search(r'快手播放[\s]*([\d.]+)\s*[亿wW万]?', text)
    if match:
        val = float(match.group(1))
        heat_data['kuaishou_play'] = val * 10000 if '亿' in text else val

    # ADX日榜排名
    match = re.search(r'ADX日榜第(\d+)名', text)
    if match:
        heat_data['adx_rank'] = int(match.group(1))

    return heat_data

def get_main_heat(heat_data):
    """获取主要热度值，用于排序和筛选"""
    # 优先级：红果热度 > 累计热力值 > 累计播放 > 红果收藏
    if 'hongguo_heat' in heat_data:
        return heat_data['hongguo_heat']
    elif 'total_heat' in heat_data:
        return heat_data['total_heat']
    elif 'total_play' in heat_data:
        return heat_data['total_play']
    elif 'hongguo_fav' in heat_data:
        return heat_data['hongguo_fav']
    return 0

def parse_tags(category_text, tier_tags):
    """解析标签"""
    tags = set()

    # 从一级类目中提取
    if category_text:
        cat = str(category_text).strip()
        if '男频' in cat:
            tags.add('男频')
        if '女频' in cat:
            tags.add('女频')

    # 从二级类目/题材中提取
    if tier_tags:
        for tag in re.split(r'[,，\s]+', str(tier_tags)):
            tag = tag.strip()
            if tag and tag not in ['/', '']:
                tags.add(tag)

    return list(tags)

def clean_data_2w():
    """清洗2万档位数据"""
    dramas = []
    with open('/tmp/price2w.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row['\ufeff序号'].strip():
                continue

            note = row.get('备注', '') or ''
            heat_data = parse_heat(note)

            # 解析题材标签
            tags = parse_tags(row.get('题材', ''), row.get('题材', ''))

            seq = row['\ufeff序号'].strip()
            drama = {
                'id': f"2w-{seq}",
                'name': row['剧目'].strip() if row['剧目'] else '',
                'episodes': row['集数'].strip() if row.get('集数') else '',
                'category': '',
                'tags': tags,
                'intro': (row.get('简介', '') or '').strip(),
                'priceTier': '20000',
                'price': 20000,
                'heat': get_main_heat(heat_data),
                'heatData': heat_data,
                'heatRaw': note.strip() if note else '',
                'launchDate': row.get('上线日期', '') or '',
                'link': row.get('样片链接', '') or '',
                'duration': row.get('时长min', '') or ''
            }
            dramas.append(drama)

    return dramas

def clean_data_4k():
    """清洗4000档位数据"""
    dramas = []
    with open('/tmp/price4000.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if not row.get('短剧名称', '').strip():
                continue

            # 解析男频/女频
            category = ''
            if row.get('一级类目：\n男频/女频'):
                cat = str(row['一级类目：\n男频/女频']).strip()
                if '男频' in cat:
                    category = '男频'
                elif '女频' in cat:
                    category = '女频'

            # 解析标签
            tags = parse_tags(
                row.get('一级类目：\n男频/女频', ''),
                row.get('二级类目\n（情节标签)', '')
            )

            drama = {
                'id': f"4k-{i+1}",
                'name': row['短剧名称'].strip(),
                'episodes': row['集数'].strip() if row.get('集数') else '',
                'category': category,
                'tags': tags,
                'intro': (row.get('简介', '') or '').strip(),
                'priceTier': '4000',
                'price': 4000,
                'heat': 0,
                'heatData': {},
                'heatRaw': '',
                'launchDate': '',
                'link': row.get('试看链接', '') or '',
                'duration': ''
            }
            dramas.append(drama)

    return dramas

def main():
    print("开始清洗2万档位数据...")
    data_2w = clean_data_2w()
    print(f"2万档位: {len(data_2w)} 条")

    print("开始清洗4000档位数据...")
    data_4k = clean_data_4k()
    print(f"4000档位: {len(data_4k)} 条")

    # 合并
    all_data = data_2w + data_4k

    # 统计有热度的数量
    with_heat = sum(1 for d in all_data if d['heat'] > 0)
    print(f"有热度数据的剧: {with_heat}/{len(all_data)}")

    # 提取所有标签用于筛选
    all_tags = set()
    for d in all_data:
        all_tags.update(d['tags'])

    # 热度范围统计
    heats = [d['heat'] for d in all_data if d['heat'] > 0]
    if heats:
        print(f"热度范围: {min(heats)} - {max(heats)}")

    # 输出
    output = {
        'dramas': all_data,
        'meta': {
            'total': len(all_data),
            'price20000': len(data_2w),
            'price4000': len(data_4k),
            'tags': sorted(list(all_tags)),
            'heatRange': {'min': min(heats) if heats else 0, 'max': max(heats) if heats else 0}
        }
    }

    os.makedirs('data', exist_ok=True)
    with open('data/dramas.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n数据清洗完成，输出到 data/dramas.json")
    print(f"总计: {len(all_data)} 部剧")

if __name__ == '__main__':
    main()
