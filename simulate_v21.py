
score=0
world={"marketTrust":0,"stationPower":0,"hospitalTrust":0,"theaterPower":0,"doorProgress":0}
steps=[]
def inspect(where,n=3):
    global score
    score += n
    steps.append(f"inspect:{where}+{n} score={score}")
def choose(event,val):
    if event=="market": world["marketTrust"] += {"help":2,"investigate":0,"ignore":-1}[val]
    if event=="station": world["stationPower"] += {"repair":2,"break":-1}[val]
    if event=="hospital": world["hospitalTrust"] += {"believe":2,"report":1}[val]
    if event=="theater": world["theaterPower"] += {"watch":2,"burn":-2}[val]
    if event=="gate" and val=="turn": world["doorProgress"] += 1
    steps.append(f"choice:{event}={val}")

inspect("estate",3); inspect("market",3); choose("market","help")
inspect("pier",3); inspect("canal",3)
assert score>=8, "archive should unlock"
inspect("archive",3); choose("station","repair")
inspect("station",3)
assert score>=14, "station should unlock"
inspect("district",3); inspect("hospital",3); choose("hospital","believe")
assert score>=22, "hospital should unlock"
inspect("theater",3); choose("theater","watch")
# revisit the theater and inspect multiple points until the chapter threshold is reached
inspect("theater",3); inspect("theater",3); inspect("theater",3)
assert score>=32, "theater should unlock"
choose("gate","turn"); choose("gate","turn")
assert world["doorProgress"]>=2, "deep gate should unlock"
steps.append("ending:WHITE_FRAGMENT")
print("PASS")
print("\n".join(steps))
print("world=",world)
